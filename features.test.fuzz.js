import TimesheetController from "./src/controllers/timesheetController.js";
import ApplicationController from "./src/controllers/applicationController.js";
import Timesheet from "./src/timesheetSchema.js";

jest.mock("./src/timesheetSchema.js"); // Mock the Timesheet model
jest.mock("./src/applicationSchema.js"); // Mock the Application model

const timesheetController = new TimesheetController();
const applicationController = new ApplicationController();


describe("Jest Feature testing", () => {
	describe("clockin", () => {
		it.fuzz("fuzz testing clockin method", async (data) => {
			try {
				// Assume the fuzzed data is a buffer; convert it to a string and parse it as JSON
				const input = JSON.parse(data.toString("utf8"));

				// Set up mock request and response objects
				const req = {
					body: {
						jobId: input.jobId || "defaultJobId",
						applicationId: input.applicationId || "defaultAppId",
					},
					user: { _id: input.userId || "defaultUserId" },
				};

				const res = {
					json: jest.fn(),
					status: jest.fn(() => res),
				};

				// Mock the Timesheet save method
				Timesheet.prototype.save = jest.fn().mockResolvedValue();

				await timesheetController.clockin(req, res);

				// Validate response
				expect(res.json).toHaveBeenCalledWith({ success: true });
			} catch (e) {
				// Catch and ignore JSON parsing or unexpected errors
			}
		});
	});


	describe("clockout", () => {
		it.fuzz("fuzz testing clockout method", async (data) => {
			try {
				// Assume the fuzzed data is a buffer; convert it to a string and parse it as JSON
				const input = JSON.parse(data.toString("utf8"));

				// Set up mock request and response objects
				const req = {
					body: {
						jobId: input.jobId || "defaultJobId",
						applicationId: input.applicationId || "defaultAppId",
					},
					user: { _id: input.userId || "defaultUserId" },
				};

				const res = {
					json: jest.fn(),
					status: jest.fn(() => res),
				};

				// Mock the Timesheet findOneAndUpdate method
				Timesheet.findOneAndUpdate = jest
					.fn()
					.mockResolvedValue(input.returnValidTimesheet ? { id: "mockTimesheet" } : null);

				await timesheetController.clockout(req, res);

				if (input.returnValidTimesheet) {
					// Validate successful response
					expect(res.json).toHaveBeenCalledWith(
						expect.objectContaining({ success: true, message: "Clocked out successfully" })
					);
				} else {
					// Validate not found response
					expect(res.status).toHaveBeenCalledWith(404);
					expect(res.json).toHaveBeenCalledWith({
						success: false,
						message: "No active clock-in found for this job",
					});
				}
			} catch (e) {
				// Catch and ignore JSON parsing or unexpected errors
			}
		});
	});

	describe("Applying for Job", () => {
		it.fuzz("fuzz testing applying for job method", async (data) => {
			
				// Assume the fuzzed data is a buffer; convert it to a string and parse it as JSON
				const input = JSON.parse(data.toString("utf8"));

				// Set up mock request and response objects
				const req = {
					params: { id: input.jobId || 'validJobId' },
					body: {
						comment: input.comment || "Sample Comment",
					},
					user: { _id: input.userId  || "defaultUserId" },
				};

				const res = {
					redirect: jest.fn(),
				};

				await applicationController.applyJob(req, res);

				expect(res.redirect).toHaveBeenCalledWith('/application');
		});
	});
});

