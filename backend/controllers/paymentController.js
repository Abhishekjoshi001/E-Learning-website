// import { createOrder, captureOrder } from '../services/paypalService.js';
// import Purchase from '../models/purchaseModel.js';
// import Course from '../models/courseModel.js';

// // Create PayPal payment
// export const createPayment = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     // Get course details
//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }

//     // Check if course is free
//     if (course.isFree || course.price === 0) {
//       return res.status(400).json({ message: 'This course is free. Use free enrollment endpoint.' });
//     }

//     // Check if user already purchased
//     const existingPurchase = await Purchase.findOne({
//       userId,
//       courseId,
//       status: 'completed'
//     });

//     if (existingPurchase) {
//       return res.status(400).json({ message: 'Course already purchased' });
//     }

//     // Create PayPal order
//     const orderData = {
//       courseId: course._id,
//       title: course.title,
//       price: course.price
//     };

//     const order = await createOrder(orderData);

//     // Save pending purchase
//     const purchase = new Purchase({
//       userId,
//       courseId,
//       paypalOrderId: order.result.id,
//       amount: course.price,
//       currency: course.currency,
//       status: 'pending'
//     });

//     await purchase.save();

//     res.json({
//       success: true,
//       orderId: order.result.id,
//       approvalUrl: order.result.links.find(link => link.rel === 'approve').href
//     });

//   } catch (error) {
//     console.error('Payment creation error:', error);
//     res.status(500).json({ message: 'Failed to create payment' });
//   }
// };

// // Capture PayPal payment
// export const capturePayment = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const userId = req.user.id;

//     // Find pending purchase
//     const purchase = await Purchase.findOne({
//       paypalOrderId: orderId,
//       userId,
//       status: 'pending'
//     });

//     if (!purchase) {
//       return res.status(404).json({ message: 'Purchase not found' });
//     }

//     // Capture PayPal payment
//     const captureResult = await captureOrder(orderId);

//     if (captureResult.result.status === 'COMPLETED') {
//       // Update purchase status
//       purchase.status = 'completed';
//       purchase.paymentDetails = captureResult.result;
//       await purchase.save();

//       res.json({
//         success: true,
//         message: 'Payment completed successfully',
//         purchaseId: purchase._id
//       });
//     } else {
//       purchase.status = 'failed';
//       await purchase.save();
//       res.status(400).json({ message: 'Payment failed' });
//     }

//   } catch (error) {
//     console.error('Payment capture error:', error);
//     res.status(500).json({ message: 'Failed to capture payment' });
//   }
// };

// // Enroll in free course
// export const enrollFree = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }

//     if (!course.isFree && course.price > 0) {
//       return res.status(400).json({ message: 'This course requires payment' });
//     }

//     // Check if already enrolled
//     const existingPurchase = await Purchase.findOne({
//       userId,
//       courseId,
//       status: 'completed'
//     });

//     if (existingPurchase) {
//       return res.status(400).json({ message: 'Already enrolled in this course' });
//     }

//     // Create free enrollment record
//     const purchase = new Purchase({
//       userId,
//       courseId,
//       paypalOrderId: `free_${Date.now()}`,
//       amount: 0,
//       status: 'completed'
//     });

//     await purchase.save();

//     res.json({
//       success: true,
//       message: 'Successfully enrolled in free course',
//       purchaseId: purchase._id
//     });

//   } catch (error) {
//     console.error('Free enrollment error:', error);
//     res.status(500).json({ message: 'Failed to enroll in course' });
//   }
// };

// // Check course access
// export const checkAccess = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user.id;

//     const purchase = await Purchase.findOne({
//       userId,
//       courseId,
//       status: 'completed'
//     });

//     res.json({
//       hasAccess: !!purchase,
//       purchaseDate: purchase ? purchase.createdAt : null
//     });

//   } catch (error) {
//     console.error('Access check error:', error);
//     res.status(500).json({ message: 'Failed to check access' });
//   }
// };