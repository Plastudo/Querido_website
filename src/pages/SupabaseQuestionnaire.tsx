import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseQuestionnaire } from '../hooks/useSupabaseQuestionnaire';
import QuestionRenderer from '../components/Questionnaire/QuestionRenderer';
import LiveBudgetPanel from '../components/Questionnaire/LiveBudgetPanel';
import ConsolidatedBudgetView from '../components/Budget/ConsolidatedBudgetView';
import ProgressBar from '../components/ProgressBar';
import { liveBudgetToProjectBudget } from '../utils/budgetConverter';
import type { Region, Project } from '../types';

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  questionPrefix?: string;
  categoryLabel?: string;
}

export default function SupabaseQuestionnaire({
  questionPrefix,
  categoryLabel: labelProp = 'Questionário',
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as { project?: Project; categoryLabel?: string } | null;
  const project = locationState?.project ?? null;
  const categoryLabel = locationState?.categoryLabel ?? labelProp;
  const region = (searchParams.get('region') as Region) ?? 'Norte';

  const {
    currentQuestion,
    answers,
    budget,
    progress,
    isLoading,
    isComplete,
    error,
    canGoBack,
    answerWithOption,
    answerNumeric,
    answerText,
    goBack,
  } = useSupabaseQuestionnaire(questionPrefix);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
          A carregar questionário…
        </p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, flexDirection: 'column', gap: 'var(--space-4)',
      }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
          Erro ao carregar: {error}
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // ── Complete: show ConsolidatedBudgetView (same as other questionnaires) ────
  if (isComplete) {
    const updatedProject: Project = {
      region,
      divisions: [
        ...(project?.divisions ?? []),
        {
          workType: questionPrefix ?? 'sala',
          label: categoryLabel,
          budget: liveBudgetToProjectBudget(budget),
          answers,
        },
      ],
    };

    return (
      <ConsolidatedBudgetView
        project={updatedProject}
        onBack={edited => navigate('/', { state: { project: edited } })}
        onAddDivision={edited => navigate('/', { state: { project: edited } })}
        onPreview={data => navigate('/orcamento/preview', { state: data })}
      />
    );
  }

  // ── In progress ─────────────────────────────────────────────────────────────
  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>

      {/* Left: progress + question */}
      <div style={{
        width: '50%', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        padding: 'var(--space-8) var(--space-10)',
      }}>
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <button
            onClick={() => navigate('/', { state: { project } })}
            className="btn btn-ghost btn--sm"
            style={{ padding: '2px 0', marginBottom: 'var(--space-5)', fontSize: 13, color: 'var(--color-text-tertiary)' }}
          >
            ← Início
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}>
              {categoryLabel}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {progress}% concluído
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        <div style={{ flex: 1 }}>
          {currentQuestion ? (
            <QuestionRenderer
              question={currentQuestion}
              savedAnswer={answers[currentQuestion.index]}
              onAnswerWithOption={answerWithOption}
              onAnswerNumeric={answerNumeric}
              onAnswerText={answerText}
              onBack={goBack}
              canGoBack={canGoBack}
            />
          ) : null}
        </div>
      </div>

      {/* Right: live budget */}
      <div style={{
        width: '50%', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        borderLeft: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-8) var(--space-10)',
      }}>
        <LiveBudgetPanel budget={budget} />
      </div>

    </div>
  );
}
