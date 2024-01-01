import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-downloads'
import * as os from 'os'
import registry from 'get-registry'
import { FFmpeg } from './ffmpeg'

export * from './ffmpeg'

const platform = os.platform()
const arch = os.arch()

export const name = 'ffmpeg'

export const Config = Schema.object({})

export const inject = ['downloads']

export async function apply(ctx: Context) {
  const task = ctx.downloads.nereid('ffmpeg', [
    `npm://@koishijs-assets/ffmpeg?registry=${await registry()}`
  ], bucket())
  const path = await task.promise
  const executable = platform === 'win32' ? `${path}/ffmpeg.exe` : `${path}/ffmpeg`
  ctx.plugin(FFmpeg, executable)
}

function bucket() {
  let bucket = 'ffmpeg-'
  switch (platform) {
    case 'win32':
      bucket += 'windows-'
      break
    case 'linux':
      bucket += 'linux-'
      break
    case 'darwin':
      bucket += 'macos-'
      break
    default:
      throw new Error('unsupported platform')
  }
  switch (arch) {
    case 'arm':
      bucket += 'armel'
      break
    case 'arm64':
      bucket += 'arm64'
      break
    case 'x86':
      bucket += 'i686'
      break
    case 'x64':
      bucket += 'amd64'
      break
    default:
      throw new Error('unsupported arch')
  }
  return bucket
}
