import Modal from '../../../components/Modal.jsx'
import '../../../css/home-apikey.css'

/**
 * 넥슨 오픈 API 발급 절차 안내 (openapi.nexon.com 공식 가이드
 * "사전 준비하기" 문서 기준 - 로그인 -> 애플리케이션 등록 -> 키 자동 발급
 * -> 애플리케이션 상세에서 확인, 이 4단계 그대로).
 */
export default function ApiKeyGuideModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="API 키는 어떻게 받나요?">
      <ol className="apikey-guide__steps">
        <li>
          <strong>로그인</strong> — <a href="https://openapi.nexon.com" target="_blank" rel="noopener noreferrer">openapi.nexon.com</a>에
          접속해서 오른쪽 위 <strong>로그인</strong> 버튼으로 넥슨 ID 로그인
        </li>
        <li>
          <strong>애플리케이션 등록</strong> — <strong>내 애플리케이션 → 애플리케이션 등록</strong>에서
          게임(메이플스토리)과 애플리케이션 타입, 서비스명 등을 입력하고 이용약관 동의 후 등록
        </li>
        <li>
          <strong>API 키 자동 발급</strong> — 애플리케이션 등록이 끝나면 키가 자동으로 발급돼요
        </li>
        <li>
          <strong>키 확인</strong> — <strong>내 애플리케이션 → 애플리케이션 목록</strong>에서 방금 만든
          애플리케이션 상세 페이지로 들어가면 발급된 키를 볼 수 있어요
        </li>
      </ol>
      <p className="apikey-guide__note">
        애플리케이션 하나당 API 키는 최대 2개까지, 같은 게임으로는 넥슨 ID 하나당 애플리케이션을
        최대 3개까지 등록할 수 있어요.
      </p>
      <p className="apikey-guide__note">
        발급받은 키를 이 화면 입력창에 붙여넣으면 되고, 서버로 따로 전송되지 않고 이 브라우저에만
        저장돼요.
      </p>
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
