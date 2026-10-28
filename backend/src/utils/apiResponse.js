class ApiResponse {
    constructor(
        statusCode,
        arg2 = null,
        arg3 = "Success"
    ) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;

        // If only message was passed: new ApiResponse(200, "Success message")
        if (typeof arg2 === "string" && (arg3 === "Success" || arg3 === null || arg3 === undefined)) {
            this.message = arg2;
            this.data = null;
        } else if (typeof arg2 === "string" && typeof arg3 !== "string") {
            // Passed as (statusCode, message, data)
            this.message = arg2;
            this.data = arg3;
        } else {
            // Passed as (statusCode, data, message)
            this.data = arg2;
            this.message = typeof arg3 === "string" ? arg3 : "Success";
        }
    }
}
export {ApiResponse};
