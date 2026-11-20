const Inventory = require('../models/Inventory')
const ApiError = require('../utils/ApiError')
const { applyInventoryMovement } = require('./inventoryMovementService')

async function reserveStock(items, branchId, userId) {
  const reservations = []

  try {
    for (const item of items) {
      const inventory = await Inventory.findOne({ product: item.productId, branch: branchId })
      if (!inventory) {
        throw ApiError.conflict(`${item.name} is not available at the selected branch`)
      }

      const available = inventory.quantity - inventory.reserved
      if (available < item.quantity) {
        throw ApiError.conflict(
          available > 0
            ? `Only ${available} of ${item.name} left at the selected branch`
            : `${item.name} is out of stock at the selected branch`,
        )
      }

      const updatedInventory = await applyInventoryMovement({
        inventoryId: inventory._id,
        reservedDelta: item.quantity,
        type: 'reservation',
        source: 'order',
        reason: 'Stock reserved for checkout',
        performedBy: userId,
      })
      reservations.push({ inventoryId: updatedInventory._id, quantity: item.quantity, userId })
    }
  } catch (error) {
    await releaseReserved(reservations)
    throw error
  }

  return reservations
}

async function releaseReserved(reservations) {
  await Promise.all(
    reservations.map((reservation) =>
      applyInventoryMovement({
        inventoryId: reservation.inventoryId,
        reservedDelta: -reservation.quantity,
        type: 'reservation_released',
        source: 'system',
        reason: 'Checkout reservation released',
        performedBy: reservation.userId,
      }),
    ),
  )
}

async function commitReserved(reservations, orderId) {
  await Promise.all(
    reservations.map((reservation) =>
      applyInventoryMovement({
        inventoryId: reservation.inventoryId,
        quantityDelta: -reservation.quantity,
        reservedDelta: -reservation.quantity,
        type: 'sale',
        source: 'order',
        reason: 'Stock sold on order placement',
        performedBy: reservation.userId,
        referenceId: orderId,
      }),
    ),
  )
}

async function restoreStock(items, branchId, orderId, userId) {
  await Promise.all(
    items.map(async (item) => {
      const inventory = await Inventory.findOne({ product: item.product, branch: branchId })
      if (!inventory) throw ApiError.notFound('Inventory record not found while restoring stock')
      return applyInventoryMovement({
        inventoryId: inventory._id,
        quantityDelta: item.quantity,
        type: 'order_cancelled',
        source: 'order',
        reason: 'Stock restored after order cancellation',
        performedBy: userId,
        referenceId: orderId,
      })
    }),
  )
}

async function getAvailability(productIds, branchId) {
  const rows = await Inventory.find({ product: { $in: productIds }, branch: branchId })
  const map = new Map()
  for (const row of rows) {
    map.set(row.product.toString(), {
      available: Math.max(0, row.quantity - row.reserved),
      status: row.stockStatus,
    })
  }
  return map
}

module.exports = {
  reserveStock,
  releaseReserved,
  commitReserved,
  restoreStock,
  getAvailability,
}
