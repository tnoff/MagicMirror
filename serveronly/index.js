const app = require("../js/app");
const Log = require("../js/logger");

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { Resource } = require("@opentelemetry/resources");

const service_name = process.env.OTEL_SERVICE_NAME || "magic-mirror";
const trace_endpoint = process.env.OTEL_TRACE_ENDPOINT || "http://localhost:4318/v1/traces";

const resource = Resource.default().merge(
	new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: service_name,
		[SemanticResourceAttributes.SERVICE_VERSION]: "0.0.1"
	})
);
const provider = new NodeTracerProvider({ resource: resource });
const exporter = new OTLPTraceExporter({
	url: trace_endpoint
});
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);
provider.register();

const sdk = new NodeSDK({
	traceExporter: exporter,
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();


app.start().then((config) => {
	const bindAddress = config.address ? config.address : "localhost";
	const httpType = config.useHttps ? "https" : "http";
	Log.info(`\n>>>   Ready to go! Please point your browser to: ${httpType}://${bindAddress}:${config.port}   <<<`);
});
