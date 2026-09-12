import dataSource from './data-source'
import { runSeed } from './seed-data'

async function main() {
  await dataSource.initialize()
  const messages = await runSeed(dataSource)
  await dataSource.destroy()
  // eslint-disable-next-line no-console
  console.log(messages.join(' | '))
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
