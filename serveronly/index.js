const app = require("../js/app");
const Log = require("../js/logger");

import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
	traceExporter: new ConsoleSpanExporter(),
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();


app.start().then((config) => {
	const bindAddress = config.address ? config.address : "localhost";
	const httpType = config.useHttps ? "https" : "http";
	Log.info(`\n>>>   Ready to go! Please point your browser to: ${httpType}://${bindAddress}:${config.port}   <<<`);
});
