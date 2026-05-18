import { useLocation, useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import ConsolidatedBudgetView from '../components/Budget/ConsolidatedBudgetView';

export default function ProjectBudget() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const s = state as { project?: Project; savedBudgetId?: string } | null;
  const project = s?.project;
  const savedBudgetId = s?.savedBudgetId;

  if (!project || project.divisions.length === 0) {
    navigate('/', { replace: true });
    return null;
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
