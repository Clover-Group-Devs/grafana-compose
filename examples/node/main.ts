import * as api from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { config } from "./config";

// Configure the OTLP exporter to send traces to Tempo
const traceExporter = new OTLPTraceExporter({
  url: config.tempoUrl, // Tempo OTLP HTTP endpoint
  headers: {},
});

// Initialize the OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
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
  console.log("Traces sent to Tempo!");
}

main().catch(console.error);
