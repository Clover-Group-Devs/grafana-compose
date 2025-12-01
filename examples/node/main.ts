import * as api from "@opentelemetry/api";
import * as logs from "@opentelemetry/api-logs";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { config } from "./config";

// Configure the OTLP exporter to send traces to Tempo
const traceExporter = new OTLPTraceExporter({
  url: config.tempoUrl, // Tempo OTLP HTTP endpoint
  headers: {},
});

// Configure the OTLP exporter to send logs to Loki
const logExporter = new OTLPLogExporter({
  url: config.lokiUrl, // Loki OTLP HTTP endpoint
  headers: {},
});

// Initialize the OpenTelemetry SDK with both trace and log exporters
const sdk = new NodeSDK({
  traceExporter,
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

// Get logger from the global logger provider (set by SDK)
const logger = logs.logs.getLogger("console-logger", "1.0.0");
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args: any[]) => {
  originalConsoleLog(...args);
  logger.emit({
    severityText: "INFO",
    body: args.map((arg) => String(arg)).join(" "),
    attributes: { level: "info" },
  });
};

console.error = (...args: any[]) => {
  originalConsoleError(...args);
  logger.emit({
    severityText: "ERROR",
    body: args.map((arg) => String(arg)).join(" "),
    attributes: { level: "error" },
  });
};

console.warn = (...args: any[]) => {
  originalConsoleWarn(...args);
  logger.emit({
    severityText: "WARN",
    body: args.map((arg) => String(arg)).join(" "),
    attributes: { level: "warn" },
  });
};

console.info = (...args: any[]) => {
  originalConsoleInfo(...args);
  logger.emit({
    severityText: "INFO",
    body: args.map((arg) => String(arg)).join(" "),
    attributes: { level: "info" },
  });
};

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => originalConsoleLog("Tracing and logging terminated"))
    .catch((error) =>
      originalConsoleLog("Error terminating tracing/logging", error)
    )
    .finally(() => process.exit(0));
});

// Example application code with manual tracing
async function main() {
  const tracer = api.trace.getTracer("example-tracer", "1.0.0");

  // Create a root span
  await tracer.startActiveSpan("main-operation", async (span) => {
    console.log("Starting main operation...");

    // Simulate some work
    await tracer.startActiveSpan("fetch-data", async (childSpan) => {
      console.log("Fetching data...");
      await new Promise((resolve) => setTimeout(resolve, 100));
      childSpan.setAttribute("data.size", 1024);
      childSpan.setAttribute("data.source", "database");
      childSpan.end();
    });

    // Simulate more work
    await tracer.startActiveSpan("process-data", async (childSpan) => {
      console.log("Processing data...");
      await new Promise((resolve) => setTimeout(resolve, 200));
      childSpan.setAttribute("processed.records", 42);
      childSpan.end();
    });

    // Simulate final work
    await tracer.startActiveSpan("save-results", async (childSpan) => {
      console.log("Saving results...");
      await new Promise((resolve) => setTimeout(resolve, 150));
      childSpan.setAttribute("saved.records", 42);
      childSpan.setStatus({ code: api.SpanStatusCode.OK });
      childSpan.end();
    });

    span.setStatus({ code: api.SpanStatusCode.OK });
    console.log("Main operation completed!");
    span.end();
  });

  // Flush and shutdown
  await sdk.shutdown();
  originalConsoleLog("Traces sent to Tempo and logs sent to Loki!");
}

main().catch(console.error);
