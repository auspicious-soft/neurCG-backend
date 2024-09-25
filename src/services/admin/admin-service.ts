import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";
import { subscribedEmailsModel } from "src/models/subscribed-email-schema";
import { sendLatestUpdatesEmail } from "src/utils/mails/mail";
// import { clientModel } from "../../models/user/user-schema";
// import { passswordResetSchema, testMongoIdSchema } from "../../validation/admin-user";
// import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../lib/send-mail/tokens";
// import { sendPasswordResetEmail } from "../../lib/send-mail/mail";
// import { passwordResetTokenModel } from "../../models/password-forgot-schema";



interface loginInterface {
    email: string;
    password: string;
}

//Auth Services
export const loginService = async (payload: loginInterface, res: Response) => {
    const getAdmin = await adminModel.findOne({ email: payload.email.toLowerCase() }).select("+password")
    if (!getAdmin) return errorResponseHandler("Admin not found", httpStatusCode.NOT_FOUND, res)
    const passwordMatch = bcrypt.compareSync(payload.password, getAdmin.password)
    if (!passwordMatch) return errorResponseHandler("Invalid password", httpStatusCode.BAD_REQUEST, res)
    const tokenPayload = {
        id: getAdmin._id,
        email: getAdmin.email,
        // role: getAdmin.role
    }
    // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: "30d" })
    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //     domain: "24-x7-fx-admin-frontend.vercel.app",
    //     maxAge: 30  24  60  60  1000
    // })
    return { success: true, message: "Admin Login successfull", data: tokenPayload }
}



// Dashboard
export const getDashboardStatsService = async (payload: any, res: Response) => {

    return { success: true, message: "Dashboard stats fetched successfully" }

}


export const sendLatestUpdatesService = async (payload: any, res: Response) => {
    const { message, title } = payload;

    if (!message || !title) return errorResponseHandler("All fields are required", httpStatusCode.BAD_REQUEST, res);

    const bulkEmailsAddresses = await subscribedEmailsModel.find({ isUnsubscribed: false }).select("email -_id");
    if (bulkEmailsAddresses.length === 0) return errorResponseHandler("No subscribed emails found", httpStatusCode.NOT_FOUND, res);

    for (const { email } of bulkEmailsAddresses) {
        await sendLatestUpdatesEmail(email, title, message).catch((err) => {
            return errorResponseHandler("Failed to send email", httpStatusCode.INTERNAL_SERVER_ERROR, res);
        })
    }
    return {
        success: true,
        message: "Latest updates sent successfully"
    }
}
// Client Services
// export const getClientsService = async (payload: any) => {
//     const page = parseInt(payload.page as string) || 1
//     const limit = parseInt(payload.limit as string) || 10
//     const offset = (page - 1) * limit
//     const { query, sort } = queryBuilder(payload, ['firstName', 'lastName'])
//     const totalDataCount = Object.keys(query).length < 1 ? await clientModel.countDocuments() : await clientModel.countDocuments(query)
//     const clients = await clientModel.find(query).sort(sort).skip(offset).limit(limit)
//     if (clients.length) {
// Fetch clients
//     const clientAppointments = await appointmentRequestModel.find({
//         clientId: { $in: clients.map(c => c._id) }
//     }).sort({ appointmentDate: -1 });

//     // Create a map of client IDs to their appointments
//     const appointmentMap = clientAppointments.reduce((map: any, appointment: any) => {
//         if (!map[appointment.clientId.toString()]) {
//             map[appointment.clientId.toString()] = [];
//         }
//         const appointmentObj = appointment.toObject();
//         delete appointmentObj.clientId;
//         delete appointmentObj.clientName;
//         delete appointmentObj.__v
//         map[appointment.clientId.toString()].push(appointmentObj);
//         return map
//     }, {})

//     // Add appointments to each client
//     const clientsWithAppointments = clients.map(client => {
//         const clientObject = client.toObject() as any
//         clientObject.appointments = appointmentMap[client._id.toString()] || [];
//         return clientObject;
//     });

//     return {
//         success: true,
//         data: clientsWithAppointments,
//         page,
//         limit,
//         total: totalDataCount
//     };
// } else {
//     return {
//         success: false,
//         data: [],
//         page,
//         limit,
//         total: 0
//     };
// }
// }

// export const getAClientService = async (id: string, res: Response) => {
//     const client = await clientModel.findById(id)
//     if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
//     return { success: true, data: client }
// }

// export const deleteClientService = async (id: string, res: Response) => {
//     const client = await clientModel.findByIdAndDelete(id)
//     if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
//     return { success: true, message: "Client deleted successfully" }
// }

// export const updateClientService = async (payload: any, res: Response) => {
//     const { id, ...rest } = payload
//     const client = await clientModel.findById(id)
//     if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
//     const updatedClient = await clientModel.findByIdAndUpdate(id, rest, { new: true })
//     return { success: true, message: "Client status updated successfully", data: updatedClient }
// }



