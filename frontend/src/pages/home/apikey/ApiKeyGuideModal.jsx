import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import '../../../css/home-apikey.css'

// 넥슨 애플리케이션 등록 폼에 그대로 붙여넣을 값들 - mapleaudit.com/guide의
// "복사 버튼으로 값을 채워준다" 방식을 참고해서, 사용자가 넥슨 사이트에서
// 직접 타이핑하지 않고 여기서 복사해서 붙여넣기만 하면 되게 한다.
const APP_FIELDS = [
  { label: '게임 선택', value: '메이플스토리' },
  { label: '애플리케이션 타입', value: '서비스 단계' },
  { label: '대표 언어', value: '한국어' },
  { label: '출시할 서비스명', value: 'MY MAPLESTORY' },
  { label: '개발 환경', value: 'WEB' },
  { label: 'URL 정보', value: 'http://3.39.17.151' },
  { label: '태그', value: '캐릭터 정보, 유틸리티' },
  {
    label: '서비스 소개',
    value:
      '넥슨 Open API를 활용해 내 캐릭터 정보(레벨/장비/보스 클리어 현황 등)를 조회하고 관리할 수 있는 개인 캐릭터 관리 도구입니다.',
    fullWidth: true,
  },
]

/**
 * 값 옆의 복사 아이콘을 누르면 클립보드에 복사하고, 잠깐 "복사됨"으로
 * 바뀌었다가 원래대로 돌아온다. Clipboard API가 없는 아주 오래된
 * 브라우저(또는 http로 접속한 경우)에서는 조용히 실패하므로, 그 경우엔
 * 사용자가 텍스트를 직접 드래그해서 복사할 수 있게 값 자체는 항상 그대로 보여준다.
 */
function CopyField({ label, value, fullWidth }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 API를 못 쓰는 환경 - 값은 이미 화면에 보이니 직접 복사하면 된다.
    }
  }

  return (
    <div className={'apikey-guide__field' + (fullWidth ? ' apikey-guide__field--full' : '')}>
      <span className="apikey-guide__field-label">{label}</span>
      <div className="apikey-guide__field-row">
        <span className="apikey-guide__field-value">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="apikey-guide__field-copy"
          aria-label={`${label} 복사`}
        >
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
    </div>
  )
}

/**
 * 넥슨 오픈 API 발급 절차 안내 (openapi.nexon.com 공식 가이드 기준 -
 * 로그인 -> 애플리케이션 등록 -> 키 자동 발급 -> 애플리케이션 상세에서 확인).
 * mapleaudit.com/guide의 "번호 매긴 단계 + 등록 폼에 붙여넣을 값을
 * 복사 버튼으로 제공" 방식을 참고해서, 사용자가 넥슨 사이트에서 뭘 입력해야
 * 할지 매번 고민하지 않고 여기서 그대로 복사해 붙여넣기만 하면 되게 한다.
 */
export default function ApiKeyGuideModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="넥슨 Open API Key 발급 가이드">
      <p className="apikey-guide__intro">
        MY MAPLESTORY를 쓰려면 넥슨 Open API 키가 필요해요. 아래 3단계면 발급 완료 - 무료이고,
        심사는 거의 즉시 통과돼요.
      </p>

      <p className="apikey-guide__warning">
        ⚠ API 키가 다른 사람에게 노출되지 않도록 주의해주세요. 노출된 경우 넥슨 사이트에서
        재발급을 권장드려요.
      </p>

      <div className="apikey-guide__step">
        <span className="apikey-guide__step-num">01</span>
        <div className="apikey-guide__step-body">
          <h3 className="apikey-guide__step-title">넥슨 오픈 API 웹사이트 접속하기</h3>
          <ol className="apikey-guide__steps">
            <li>
              <a href="https://openapi.nexon.com" target="_blank" rel="noopener noreferrer">
                openapi.nexon.com
              </a>
              에 접속해서 넥슨 계정으로 로그인해요.
            </li>
            <li>상단 메뉴에서 마이 페이지 → Nexon Open API → 애플리케이션 등록 순으로 클릭해요.</li>
          </ol>
        </div>
      </div>

      <div className="apikey-guide__step">
        <span className="apikey-guide__step-num">02</span>
        <div className="apikey-guide__step-body">
          <h3 className="apikey-guide__step-title">애플리케이션 등록하기</h3>
          <ol className="apikey-guide__steps">
            <li>Open API 서비스 이용약관에 동의해요.</li>
            <li>
              애플리케이션 정보를 아래와 같이 입력해요 - 값 오른쪽 복사 버튼을 누르면 그대로
              붙여넣을 수 있어요.
            </li>
          </ol>
          <div className="apikey-guide__fields">
            {APP_FIELDS.map((field) => (
              <CopyField key={field.label} label={field.label} value={field.value} fullWidth={field.fullWidth} />
            ))}
          </div>
          <ol className="apikey-guide__steps apikey-guide__steps--continued">
            <li>하단의 애플리케이션 등록 버튼을 눌러요.</li>
          </ol>
        </div>
      </div>

      <div className="apikey-guide__step">
        <span className="apikey-guide__step-num">03</span>
        <div className="apikey-guide__step-body">
          <h3 className="apikey-guide__step-title">발급한 API 키 확인하기</h3>
          <ol className="apikey-guide__steps">
            <li>마이 페이지 → 애플리케이션 목록에서 방금 만든 서비스명을 클릭해요.</li>
            <li>애플리케이션 상세 → 기본 정보 섹션의 API 키 값을 복사해요.</li>
            <li>이 화면 입력창에 붙여넣으면 끝이에요.</li>
          </ol>
        </div>
      </div>

      <p className="apikey-guide__note">
        복사한 키는 서버로 전송되지 않고 이 브라우저에만 저장돼요. 애플리케이션 하나당 API 키는
        최대 2개까지, 같은 게임으로는 넥슨 ID 하나당 애플리케이션을 최대 3개까지 등록할 수 있어요.
      </p>

      <div className="apikey-guide__faq">
        <p className="apikey-guide__faq-q">Q. API 키를 등록하면 내 계정이 위험해지나요?</p>
        <p className="apikey-guide__faq-a">
          아니요. 넥슨 오픈 API 키는 조회 전용(read-only) 권한만 가져요. 인게임 조작, 결제, 비밀번호
          변경 같은 행위는 할 수 없고, 넥슨 사이트에서 언제든 키를 폐기할 수 있어요.
        </p>
      </div>

      <a
        href="https://openapi.nexon.com"
        target="_blank"
        rel="noopener noreferrer"
        className="apikey-guide__cta"
      >
        openapi.nexon.com 바로가기 ↗
      </a>
    </Modal>
  )
}
