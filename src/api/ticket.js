
import odooapi from "./axios";

// Get ticket options
export const getTicketOptions = async () => {
  const response = await odooapi.get("/api/ticket/options");
  return response.data;
};

// Get current user's tickets
export const getMyTicketRequirements = async () => {
  const response = await odooapi.get("/api/ticket/my");
  return response.data;
};

// Get ticket details
export const getTicketRequirementDetail = async (ticketId) => {
  const response = await odooapi.get("/api/ticket/detail", {
    params: { id: ticketId },
  });
  return response.data;
};

// Create ticket
export const createTicketRequirement = async (payload) => {
  const response = await odooapi.post("/api/ticket/create", payload);
  return response.data;
};
export const getAdminTicketRequirements = async () => {
  const response = await odooapi.get("/api/ticket/admin");
  return response.data;
};
export const getITTicketRequirements = async () => {
  const response = await odooapi.get("/api/ticket/it");
  return response.data;
};
export const getToTickets = async () => {
  const response = await odooapi.get("/api/ticket/to");
  return response.data;
};
// Update ticket status
export const updateTicketRequirementStatus = async (payload) => {
  const response = await odooapi.post(
    "/api/ticket/update-state",
    payload
  );

  return response.data;
};
export const getTicketDepartments = async () => {
  const response = await odooapi.get("/api/ticket/departments");
  return response.data;
};