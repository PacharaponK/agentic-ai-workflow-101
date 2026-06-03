Checklist for adding a new API route to this project.

1. Add handler function in `src/walletController.js` with a `@swagger` JSDoc block above it.
2. Register the route in `src/server.js` using `app.<method>("<path>", handlerFn)`.
3. Add the new handler to the `module.exports` at the bottom of `walletController.js`.
4. Write tests covering success, 400 (invalid input), and 404 (wallet not found) cases.
5. Verify `npm test` passes and Swagger UI reflects the new endpoint.

Arguments (optional): $ARGUMENTS — describe the route to scaffold (e.g. "POST /wallets/:id/lock").
