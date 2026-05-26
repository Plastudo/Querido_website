import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Project, Region } from '../types';
import ConsolidatedBudgetView from '../components/Budget/ConsolidatedBudgetView';
import { fetchBudgetWithDivisions } from '../services/clientBudgetService';
import { fetchQuestionnaire } from '../services/questionnaireService';
import { buildBudget, answersToHistory } from '../hooks/useSupabaseQuestionnaire';
import { liveBudgetToProjectBudget } from '../utils/budgetConverter';

// ── Hook: load and reconstruct a saved budget from Supabase ──────────────────

function useLoadedBudget(savedBudgetId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const saved = await fetchBudgetWithDivisions(savedBudgetId);
        if (!saved) { setError('Orçamento não encontrado.'); return; }

        const divisionData = saved.client_budget_divisions ?? [];
        const divisions = await Promise.all(
          divisionData
            .filter(d => d.divisions?.prefix)
            .map(async d => {
              const prefix = d.divisions!.prefix!;
              const questions = await fetchQuestionnaire(prefix);
              const history = answersToHistory(d.answers as Record<string, string | number>);
              const live = buildBudget(questions, history);
              return {
                workType: prefix,
                label: d.divisions!.label,
                budget: liveBudgetToProjectBudget(live),
                answers: d.answers as Record<string, string | number>,
              };
            }),
        );

        if (!cancelled) {
          setProject({ region: (saved.region as Region) ?? 'Norte', divisions });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar orçamento.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [savedBudgetId]);

  return { project, isLoading, error };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectBudget() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const s = state as { project?: Project; savedBudgetId?: string } | null;
  const projectFromState = s?.project;
  const savedBudgetId = s?.savedBudgetId;

  // Case 1: project already in state (coming from questionnaire)
  if (projectFromState && projectFromState.divisions.length > 0) {
    return (
      <ConsolidatedBudgetView
        project={projectFromState}
        savedBudgetId={savedBudgetId}
        onBack={edited => navigate('/', { state: { project: edited } })}
        onAddDivision={edited => navigate('/', { state: { project: edited } })}
        onPreview={data => navigate('/orcamento/preview', { state: data })}
      />
    );
  }

  // Case 2: load from Supabase by savedBudgetId
  if (savedBudgetId) {
    return <LoadedBudgetView savedBudgetId={savedBudgetId} />;
  }

  navigate('/', { replace: true });
  return null;
}

function LoadedBudgetView({ savedBudgetId }: { savedBudgetId: string }) {
  const navigate = useNavigate();
  const { project, isLoading, error } = useLoadedBudget(savedBudgetId);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>A carregar orçamento…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: 16 }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>{error ?? 'Orçamento não encontrado.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar ao início</button>
      </div>
    );
  }

  return (
    <ConsolidatedBudgetView
      project={project}
      savedBudgetId={savedBudgetId}
      onBack={edited => navigate('/', { state: { project: edited } })}
      onAddDivision={edited => navigate('/', { state: { project: edited } })}
      onPreview={data => navigate('/orcamento/preview', { state: data })}
    />
  );
}
