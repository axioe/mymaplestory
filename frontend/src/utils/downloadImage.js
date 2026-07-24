import { toJpeg } from 'html-to-image'

/**
 * 특정 DOM 노드만 캡쳐해서 JPG로 다운로드한다.
 * pixelRatio를 높여서 화면 배율과 무관하게 선명하게 저장되도록 한다.
 */
export async function downloadNodeAsJpeg(node, filename) {
  if (!node) return
  const dataUrl = await toJpeg(node, {
    quality: 0.95,
    pixelRatio: 2,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
