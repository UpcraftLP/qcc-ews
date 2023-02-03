async function main() {
	const result = await fetch('http://127.0.0.1:8000/health');
	if (result.status !== 200) {
		throw new Error(`Health check failed with status code ${result.status}`);
	}
	console.log('OK');
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
