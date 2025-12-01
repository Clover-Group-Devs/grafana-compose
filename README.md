# Dokploy Grafana Monitoring Stack

A complete observability stack with **Grafana**, **Tempo**, **Loki**, and **Grafana Alloy** for distributed tracing, logging, and metrics collection. Designed to work seamlessly with Dokploy's Docker network.

![Dokploy Integration](docs/dokploy.png)

<img src="docs/dokploy-metrics.png" alt="Metrics" width="400"/>

<img src="docs/dokploy-alloy.png" alt="Alloy" width="400"/>

## Overview

This stack provides a production-ready monitoring solution with:

- **Grafana Alloy**: Unified collector for traces, logs, and metrics (OTLP & Faro receivers)
- **Tempo**: High-scale distributed tracing backend
- **Loki**: Log aggregation and querying
- **Grafana**: Visualization and correlation of traces, logs, and metrics

## Tracing

![Distributed Tracing](docs/tracing.png)

## Commands

```sh
(cd examples/node && pnpm start)
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Links

- [Grafana Documentation](https://grafana.com/docs/)
- [Tempo Documentation](https://grafana.com/docs/tempo/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Dokploy Documentation](https://dokploy.com/)
