export const rfidService = {
	reader: null as ReadableStreamDefaultReader<string> | null,

	openPort: async () => {
		const port = await (navigator as any).serial.requestPort();

		if (!port.readable) {
			// Only open if not already open
			await port.open({ baudRate: 9600 }); // Match your Pico's baud rate!
		}
		return port;
	},

	startListening: async (port: any, onScan: (uuid: string) => void) => {
		if (!port.readable) return;

		const textDecoder = new TextDecoderStream();
		port.readable.pipeTo(textDecoder.writable);
		const reader = textDecoder.readable.getReader();
		rfidService.reader = reader;

		let buffer = "";

		try {
			while (rfidService.reader) {
				const { value, done } = await reader.read();
				if (done) break;

				if (value) {
					buffer += value;

					let newlineIndex: number;
					// biome-ignore lint/suspicious/noAssignInExpressions: you're just a hater
					while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
						const cleanUuid = buffer.slice(0, newlineIndex).trim();
						buffer = buffer.slice(newlineIndex + 1);

						if (cleanUuid) {
							onScan(cleanUuid);
						}
					}
				}
			}
		} catch (error) {
			console.error("Reading error", error);
		} finally {
			reader.releaseLock();
		}
	},

	closePort: async (port: any) => {
		if (!port) return;

		// cancel the reader if active
		if (rfidService.reader) {
			try {
				await rfidService.reader.cancel();
			} catch (e) {
				console.error("Error canceling reader", e);
			} finally {
				rfidService.reader.releaseLock();
				rfidService.reader = null;
			}
		}

		// wait a bit for the lock to actually release
		// before attempting to close the port
		// sometimes there is a race condition...
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (port.readable) {
			await port.close();
		}
	},

	isSupported: () => {
		return "serial" in navigator;
	},
};
