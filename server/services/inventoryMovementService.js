const Inventory = require('../models/Inventory')
const InventoryMovement = require('../models/InventoryMovement')
const ApiError = require('../utils/ApiError')

async function applyInventoryMovement({
  inventoryId,
  quantityDelta = 0,
  targetQuantity,
  reservedDelta = 0,
  type,
  source,
  reason = '',
  performedBy = null,
  referenceId = null,
}) {
  const current = await Inventory.findById(inventoryId)
  if (!current) throw ApiError.notFound('Inventory record not found')

  const resolvedQuantityDelta =
    targetQuantity === undefined ? quantityDelta : targetQuantity - current.quantity
  const quantityAfter = current.quantity + resolvedQuantityDelta
  const reservedAfter = current.reserved + reservedDelta
  if (quantityAfter < 0 || reservedAfter < 0 || quantityAfter < reservedAfter) {
    throw ApiError.badRequest('Stock cannot be lower than reserved stock or zero')
  }

  const movement = await InventoryMovement.create({
    inventory: current._id,
    product: current.product,
    branch: current.branch,
    type,
    source,
    quantityBefore: current.quantity,
    quantityDelta: resolvedQuantityDelta,
    quantityAfter,
    reservedBefore: current.reserved,
    reservedDelta,
    reservedAfter,
    reason,
    performedBy,
    referenceId,
    status: 'pending',
  })

  const updated = await Inventory.findOneAndUpdate(
    { _id: current._id, quantity: current.quantity, reserved: current.reserved },
    { $inc: { quantity: resolvedQuantityDelta, reserved: reservedDelta } },
    { new: true, runValidators: true },
  )

  if (!updated) {
    await InventoryMovement.updateOne({ _id: movement._id }, { $set: { status: 'conflict' } })
    throw ApiError.conflict('Inventory changed during this update. Refresh and try again.')
  }

  movement.status = 'completed'
  await movement.save()
  return updated
}

module.exports = { applyInventoryMovement }
