import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import type { Region, Project } from '../types';
import QuestionCard from '../components/QuestionCard';
import BudgetPanel from '../components/BudgetPanel';
import ConsolidatedBudgetView from '../components/Budget/ConsolidatedBudgetView';
import ProgressBar from '../components/ProgressBar';

const REGION_MULTIPLIER: Record<Region, number> = {
  Norte:     1.000,
  Centro:    1.075,
  LisboaSul: 1.175,
};

const WORK_TYPE_LABEL: Record<string, string> = {
  kitchen:  'Cozinha',
  bathroom: 'Casa de Banho',
};

export default function Questionnaire() {
  const { workType = '' } = useParams<{ workType: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const project = (location.state as { project?: Project } | null)?.project;

  const region = (searchParams.get('region') as Region) ?? 'Norte';
  const multiplier = REGION_MULTIPLIER[region] ?? 1;
  const workLabel = WORK_TYPE_LABEL[workType] ?? workType;

  const {
    currentQuestion,
    answers,
    progress,
    currentStep,
    totalSteps,
    goNext,
    goBack,
    isComplete,
    isLoading,
    generatedBudget,
  } = useQuestionnaire(workType);

  const isFirst = progress === 0;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm-size)' }}>
          A carregar questionário…
        </p>
      </div>
    );
  }

  // ── Concluído: orçamento consolidado com todas as divisões ────────────────────
  if (isComplete && generatedBudget) {
    const updatedProject: Project = {
      region,
      divisions: [
        ...(project?.divisions ?? []),
        { workType, label: workLabel, budget: generatedBudget },
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

  // ── Em progresso: layout de duas colunas ─────────────────────────────────────
  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>

      {/* Coluna esquerda: progresso + pergunta */}
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
              Passo {currentStep} de {totalSteps}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {progress}% concluído
            </span>
          </div>
          <ProgressBar progress={progress} steps={totalSteps} />
        </div>

        <div style={{ flex: 1 }}>
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              savedAnswer={answers[currentQuestion.id]}
              onNext={goNext}
              onBack={goBack}
              isFirst={isFirst}
            />
          ) : null}
        </div>
      </div>

      {/* Coluna direita: orçamento em tempo real */}
      <div style={{
        width: '50%', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        borderLeft: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-8) var(--space-10)',
      }}>
        <BudgetPanel
          budget={generatedBudget}
          region={region}
          multiplier={multiplier}
        />
      </div>

    </div>
  );
}
