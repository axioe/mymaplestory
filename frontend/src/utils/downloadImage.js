import { toJpeg } from 'html-to-image'

/**
 * 특정 DOM 노드만 캡쳐해서 JPG로 다운로드한다.
 * pixelRatio를 높여서 화면 배율과 무관하게 선명하게 저장되도록 한다.
 * backgroundColor는 지금 테마의 --color-page 값을 읽어와 명시적으로 넘긴다
 * (JPG는 투명을 지원하지 않아서, 지정 안 하면 여백 부분이 검게 나올 수 있다).
 */
export async function downloadNodeAsJpeg(node, filename) {
  if (!node) return
  const pageColor = getComputedStyle(document.documentElement).getPropertyValue('--color-page').trim()

  const dataUrl = await toJpeg(node, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: pageColor || '#ffffff',
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
