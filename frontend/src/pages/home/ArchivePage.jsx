import { useState } from 'react'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import CategorySelector from './CategorySelector.jsx'
import { resolveBossCycle, getValidBossContents } from '../../utils/bossHelpers.js'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

/**
 * 장비 한 칸을 눌러서 잠재능력/에디셔널 잠재능력을 펼쳐보는 목록.
 * 스케줄러/보스 목록과 같은 "클릭해서 펼치기" 상호작용을 그대로 재사용한다.
 */
function EquipmentList({ items }) {
  const [expandedSlot, setExpandedSlot] = useState(null)

  if (!items || items.length === 0) {
    return <p className="home__select-hint">장착된 장비가 없어요.</p>
  }

  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const key = `${item.slot}-${item.itemName}`
        const isExpanded = expandedSlot === key
        const hasPotential = item.potentialLines?.length > 0 || item.additionalPotentialLines?.length > 0

        return (
          <div key={key} className="home__scheduler-item">
            {item.itemIcon && (
              <img src={item.itemIcon} alt="" className="home__equipment-icon" loading="lazy" />
            )}
            <button
              type="button"
              className="home__scheduler-item-button"
              onClick={() => setExpandedSlot(isExpanded ? null : key)}
            >
              {item.itemName}
              {item.starforce && Number(item.starforce) > 0 && (
                <span className="home__equipment-starforce">★{item.starforce}</span>
              )}
            </button>
            {isExpanded && (
              <div className="home__equipment-detail">
                <p className="home__equipment-detail-slot">{item.slot}</p>
                {item.potentialLines?.length > 0 && (
                  <div className="home__equipment-potential">
                    <p className="home__equipment-potential-label">잠재능력 ({item.potentialGrade || '-'})</p>
                    {item.potentialLines.map((line) => (
                      <p key={line} className="home__equipment-potential-line">{line}</p>
                    ))}
                  </div>
                )}
                {item.additionalPotentialLines?.length > 0 && (
                  <div className="home__equipment-potential">
                    <p className="home__equipment-potential-label">
                      에디셔널 잠재능력 ({item.additionalPotentialGrade || '-'})
                    </p>
                    {item.additionalPotentialLines.map((line) => (
                      <p key={line} className="home__equipment-potential-line">{line}</p>
                    ))}
                  </div>
                )}
                {!hasPotential && <p className="home__select-hint">잠재능력이 없어요.</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * 아카이브 페이지 콘텐츠. BookFlipStage 안의 <Page>에 그대로 얹히는
 * "내용물"이라서, 자기 자신을 감싸는 책 모양이나 레이아웃(section 등)은
 * 만들지 않는다 - 다른 페이지(ApiKeyPage, CharacterSelectPage 등)와 완전히
 * 같은 방식이라 캐릭터 선택부터 이어지는 디자인이 자연스럽게 유지된다.
 *
 * 카테고리 선택 UI는 홈/다크모드 버튼 바로 아래 고정되는 CategorySelector로 뺐다
 * (예전의 큰 캡슐형 옆 패널 대신).
 *
 * 공지사항 티커는 여기 없다 - 화면 상단에 별도로 떠 있도록 Home.jsx에서 렌더링한다.
 *
 * 스케줄러와 보스는 여기서는 "개요"(요약 + 버튼)만 보여준다. 버튼을 누르면
 * (일일/주간 콘텐츠, 일일/주간 보스 - 월간 보스는 주간 보스 페이지에 통합됨) 전부 진짜 책 페이지로 실제 책장
 * 넘김이 일어난다 - onGoSchedulerDetail/onGoBossDetail이 Home.jsx의 flipTo를
 * 그대로 호출한다. 두 카테고리가 완전히 같은 방식이라 한 책이 자연스럽게
 * 이어지는 느낌을 준다.
 */
export default function ArchivePage({
  categories,
  active,
  onSelectCategory,
  onBack,
  levelHistory,
  levelHistoryLoading,
  levelHistoryError,
  eventNotices,
  eventNoticesLoading,
  eventNoticesError,
  scheduler,
  schedulerLoading,
  schedulerError,
  onGoSchedulerDetail,
  bossSelection,
  onGoBossDetail,
  equipment,
  equipmentLoading,
  equipmentError,
  setEffect,
  setEffectLoading,
  setEffectError,
}) {
  const activeLabel = categories.find((c) => c.key === active)?.label
  const [selectedPreset, setSelectedPreset] = useState(null)

  const validBossContents = scheduler ? getValidBossContents(scheduler) : []
  const dailyBossCount = validBossContents.filter((b) => resolveBossCycle(b) === 'daily').length
  const weeklyBossCount = validBossContents.filter((b) => resolveBossCycle(b) === 'weekly').length
  const monthlyBossCount = validBossContents.filter((b) => resolveBossCycle(b) === 'monthly').length

  return (
    <>
      <CategorySelector categories={categories} active={active} onSelectCategory={onSelectCategory} />

      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      {active === 'level' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">레벨 진척도</h2>

          {levelHistoryLoading && <p>최근 기록을 불러오는 중...</p>}
          {levelHistoryError && <p className="home__apikey-error">{levelHistoryError}</p>}

          {!levelHistoryLoading && !levelHistoryError && levelHistory && (
            <div className="home__level-summary">
              <p className="home__level-current">현재 Lv.{levelHistory.currentLevel}</p>
              <div className="home__level-summary-row">
                <span className="home__level-summary-label">경험치</span>
                <span className="home__level-summary-value">
                  {levelHistory.expRate != null ? `${Number(levelHistory.expRate).toFixed(2)}%` : '-'}
                </span>
              </div>
              {levelHistory.levelUpDate ? (
                <>
                  <div className="home__level-summary-row">
                    <span className="home__level-summary-label">최근 레벨업</span>
                    <span className="home__level-summary-value">{levelHistory.levelUpDate}</span>
                  </div>
                  <div className="home__level-summary-row">
                    <span className="home__level-summary-label">경과</span>
                    <span className="home__level-summary-value">
                      {levelHistory.daysSinceLevelUp === 0 ? '오늘' : `${levelHistory.daysSinceLevelUp}일 지남`}
                    </span>
                  </div>
                </>
              ) : (
                <p className="home__level-note">
                  최근 {levelHistory.lookbackDays}일 안에서는 레벨업 날짜까지는 못 찾았어요
                  (넥슨이 조회 가능한 과거 기간이 짧아서 최근 경험치%로 대신 확인해주세요).
                </p>
              )}
            </div>
          )}
        </div>
      ) : active === 'event' ? (
        <div className="home__notice-page">
          <h2 className="display home__select-title">진행 중 이벤트</h2>

          {eventNoticesLoading && <p>불러오는 중...</p>}
          {eventNoticesError && <p className="home__apikey-error">{eventNoticesError}</p>}

          {!eventNoticesLoading && !eventNoticesError && eventNotices && (
            eventNotices.length > 0 ? (
              <div className="home__notice-bookmarks">
                {eventNotices.map((n) => (
                  <a
                    key={n.noticeId ?? n.title}
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="home__notice-bookmark"
                  >
                    <span className="home__notice-bookmark-title">{n.title}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="home__select-hint">지금은 표시할 항목이 없어요.</p>
            )
          )}
        </div>
      ) : active === 'scheduler' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">스케줄러</h2>

          {schedulerLoading && <p>불러오는 중...</p>}
          {schedulerError && <p className="home__apikey-error">{schedulerError}</p>}

          {!schedulerLoading && !schedulerError && scheduler && (
            <>
              <p className="home__select-hint">
                {scheduler.characterName} · {scheduler.worldName} · Lv.{scheduler.characterLevel} ·{' '}
                {scheduler.characterClass} {scheduler.date && `(${scheduler.date.slice(0, 10)} 기준)`}
              </p>
              <div className="home__scheduler-nav">
                <button type="button" onClick={() => onGoSchedulerDetail('daily')} className="home__scheduler-nav-button">
                  일일 콘텐츠
                  <span className="home__scheduler-nav-count">{scheduler.dailyContents?.length ?? 0}</span>
                </button>
                <button type="button" onClick={() => onGoSchedulerDetail('weekly')} className="home__scheduler-nav-button">
                  주간 콘텐츠
                  <span className="home__scheduler-nav-count">{scheduler.weeklyContents?.length ?? 0}</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : active === 'boss' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">보스</h2>

          {schedulerLoading && <p>불러오는 중...</p>}
          {schedulerError && <p className="home__apikey-error">{schedulerError}</p>}

          {!schedulerLoading && !schedulerError && scheduler && (
            <>
              <p className="home__select-hint">
                {scheduler.characterName} · {scheduler.worldName} · 이번 주 보스 선택 {bossSelection.weeklySelectedCount}/
                {bossSelection.limit}마리 (주간 보스 기준)
              </p>
              <div className="home__scheduler-nav">
                <button type="button" onClick={() => onGoBossDetail('daily')} className="home__scheduler-nav-button">
                  일일 보스
                  <span className="home__scheduler-nav-count">{dailyBossCount}</span>
                </button>
                <button type="button" onClick={() => onGoBossDetail('weekly')} className="home__scheduler-nav-button">
                  주간 보스
                  <span className="home__scheduler-nav-count">{weeklyBossCount + monthlyBossCount}</span>
                </button>
              </div>
              {bossSelection.selectedCount > 0 && (
                <button type="button" onClick={bossSelection.reset} className="home__boss-reset">
                  선택 초기화
                </button>
              )}
            </>
          )}
        </div>
      ) : active === 'loot' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">전리품</h2>

          {(equipmentLoading || setEffectLoading) && <p>불러오는 중...</p>}
          {equipmentError && <p className="home__apikey-error">{equipmentError}</p>}
          {setEffectError && <p className="home__apikey-error">{setEffectError}</p>}

          {!equipmentLoading && !equipmentError && equipment && (() => {
            const effectivePreset = selectedPreset ?? equipment.activePresetNo ?? 1
            // 프리셋을 아예 안 써본 캐릭터는 preset1/2/3이 전부 비어있을 수 있는데,
            // 그럴 때만 기본 장비(defaultEquipment)로 통일해서 보여준다. 프리셋을
            // 하나라도 쓰고 있다면(하나라도 데이터가 있으면) 각 버튼은 그 프리셋
            // 고유의 장비만 정직하게 보여준다 - 비어있으면 비어있는 대로.
            const hasAnyPresetData =
              (equipment.preset1?.length ?? 0) > 0 ||
              (equipment.preset2?.length ?? 0) > 0 ||
              (equipment.preset3?.length ?? 0) > 0
            const presetItems = { 1: equipment.preset1, 2: equipment.preset2, 3: equipment.preset3 }[effectivePreset]
            const items = hasAnyPresetData ? presetItems ?? [] : equipment.defaultEquipment ?? []

            return (
              <>
                <p className="home__select-hint">{equipment.characterClass}</p>
                <div className="home__scheduler-nav">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedPreset(n)}
                      className={
                        'home__scheduler-nav-button' +
                        (effectivePreset === n ? ' home__scheduler-nav-button--active' : '')
                      }
                    >
                      프리셋 {n}
                      {equipment.activePresetNo === n && <span className="home__equipment-active-badge">사용 중</span>}
                    </button>
                  ))}
                </div>

                <EquipmentList items={items} />

                {!setEffectLoading && !setEffectError && setEffect && setEffect.setEffects?.length > 0 && (
                  <div className="home__equipment-set-effects">
                    <p className="home__select-hint">적용 세트효과</p>
                    {setEffect.setEffects.map((set) => (
                      <div key={set.setName} className="home__boss-group">
                        <p className="home__boss-group-name">
                          {set.setName} ({set.totalSetCount}세트)
                        </p>
                        {set.setEffectInfo?.map((info) => (
                          <p key={info.setCount} className="home__equipment-potential-line">
                            {info.setCount}세트: {info.setOption}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      ) : (
        <div className="home__result-content">
          <p className="display home__result-my">MY</p>
          <h1 className="display home__result-title">MAPLE STORY</h1>
          <p className="home__select-hint">'{activeLabel}' 카테고리는 아직 연동 중이에요.</p>
        </div>
      )}

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone">
        ← 캐릭터 카드로
      </button>
    </>
  )
}
