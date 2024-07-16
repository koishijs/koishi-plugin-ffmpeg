import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-downloads'
import * as os from 'node:os'
import registry from 'get-registry'
import { FFmpeg } from './ffmpeg'
import { existsSync } from 'node:fs'

export * from './ffmpeg'

const platform = os.platform()
const arch = os.arch()

export const name = 'ffmpeg'

export interface Config {
  path?: string
}

export const Config: Schema<Config> = Schema.object({
  path: Schema.path().default(globalThis.process?.env?.FFMPEG_PATH).description('如果该配置项指定的 FFmpeg 不存在，将会自动获取它')
})

export const inject = ['downloads']

export async function apply(ctx: Context, cfg: Config) {
  let executable: string
  if (cfg.path && existsSync(cfg.path)) {
    executable = cfg.path
  } else {
    const task = ctx.downloads.nereid('ffmpeg', [
      `npm://@koishijs-assets/ffmpeg?registry=${await registry()}`
    ], bucket())
    const path = await task.promise
    executable = platform === 'win32' ? `${path}/ffmpeg.exe` : `${path}/ffmpeg`
  }
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
