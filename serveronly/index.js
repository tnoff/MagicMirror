const app = require("../js/app");
const Log = require("../js/logger");

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { Resource } = require("@opentelemetry/resources");

const resource = Resource.default().merge(
	new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: "magic-mirror",
		[SemanticResourceAttributes.SERVICE_VERSION]: "0.0.1"
	})
);
const provider = new NodeTracerProvider({ resource: resource });
const exporter = new OTLPTraceExporter();
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
