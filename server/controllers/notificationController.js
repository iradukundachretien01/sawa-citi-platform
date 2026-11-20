const Notification = require('../models/Notification')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const list = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
  const unread = await Notification.countDocuments({ user: req.user._id, read: false })
  res.json({ success: true, data: notifications, meta: { unread } })
})

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id })
  if (!notification) {
    throw ApiError.notFound('Notification not found')
  }
  notification.read = true
  await notification.save()
  res.json({ success: true, data: notification })
})

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
  res.json({ success: true, message: 'All notifications marked as read' })
})

module.exports = { list, markRead, markAllRead }
