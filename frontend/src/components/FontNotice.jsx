import '../css/font-notice.css'

/**
 * 예전엔 책 안쪽(foreignObject) 좌상단에 있었지만,
 * 책 크기와 무관하게 항상 같은 자리에 보이도록 책 밖으로 뺐다.
 */
export default function FontNotice() {
  return (
    <p className="font-notice">
      이 페이지에는 메이플스토리가 제공한 메이플스토리 서체가 적용되어 있습니다.
    </p>
  )
}
