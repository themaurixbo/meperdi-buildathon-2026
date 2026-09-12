import { publicHandlers } from './public'
import { authHandlers } from './auth'
import { ownerHandlers } from './owner'
import { rewardHandlers } from './reward'
import { partnerHandlers } from './partner'
import { adminHandlers } from './admin'

export const handlers = [
  ...publicHandlers,
  ...authHandlers,
  ...ownerHandlers,
  ...rewardHandlers,
  ...partnerHandlers,
  ...adminHandlers,
]
