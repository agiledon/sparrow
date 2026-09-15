import specLayoutGuideMd from './templates/shared/spec-layout-guide.md';
export const specLayoutGuide = specLayoutGuideMd;

import skill_sparrow_apply from './templates/skills/sparrow-apply.md';
import skill_sparrow_arch from './templates/skills/sparrow-arch.md';
import skill_sparrow_archive from './templates/skills/sparrow-archive.md';
import skill_sparrow_design from './templates/skills/sparrow-design.md';
import skill_sparrow_model from './templates/skills/sparrow-model.md';
import skill_sparrow_plan from './templates/skills/sparrow-plan.md';
import skill_sparrow_requirement from './templates/skills/sparrow-requirement.md';
import skill_sparrow_supporting_harness from './templates/skills/sparrow-supporting-harness.md';
import skill_sparrow_supporting_reconcile from './templates/skills/sparrow-supporting-reconcile.md';
import skill_sparrow_verify from './templates/skills/sparrow-verify.md';

export const skillTemplates: Record<string, string> = {
  'sparrow-apply.md': skill_sparrow_apply,
  'sparrow-arch.md': skill_sparrow_arch,
  'sparrow-archive.md': skill_sparrow_archive,
  'sparrow-design.md': skill_sparrow_design,
  'sparrow-model.md': skill_sparrow_model,
  'sparrow-plan.md': skill_sparrow_plan,
  'sparrow-requirement.md': skill_sparrow_requirement,
  'sparrow-supporting-harness.md': skill_sparrow_supporting_harness,
  'sparrow-supporting-reconcile.md': skill_sparrow_supporting_reconcile,
  'sparrow-verify.md': skill_sparrow_verify,
};

import wf_sparrow_apply from './workflow-blocks/sparrow-apply.md';
import wf_sparrow_arch from './workflow-blocks/sparrow-arch.md';
import wf_sparrow_archive from './workflow-blocks/sparrow-archive.md';
import wf_sparrow_design from './workflow-blocks/sparrow-design.md';
import wf_sparrow_model from './workflow-blocks/sparrow-model.md';
import wf_sparrow_plan from './workflow-blocks/sparrow-plan.md';
import wf_sparrow_requirement from './workflow-blocks/sparrow-requirement.md';
import wf_sparrow_verify from './workflow-blocks/sparrow-verify.md';

export const workflowBlocks: Record<string, string> = {
  'sparrow-apply.md': wf_sparrow_apply,
  'sparrow-arch.md': wf_sparrow_arch,
  'sparrow-archive.md': wf_sparrow_archive,
  'sparrow-design.md': wf_sparrow_design,
  'sparrow-model.md': wf_sparrow_model,
  'sparrow-plan.md': wf_sparrow_plan,
  'sparrow-requirement.md': wf_sparrow_requirement,
  'sparrow-verify.md': wf_sparrow_verify,
};

import h_templates_harness_apply_implementation_md from './templates/harness/apply/implementation.md';
import h_templates_harness_arch_application_md from './templates/harness/arch/application.md';
import h_templates_harness_arch_business_md from './templates/harness/arch/business.md';
import h_templates_harness_arch_frontend_md from './templates/harness/arch/frontend.md';
import h_templates_harness_constitution_md from './templates/harness/constitution.md';
import h_templates_harness_global_readme_md from './templates/harness/global/README.md';
import h_templates_harness_global_always_interactive_interaction_md from './templates/harness/global/always/interactive-interaction.md';
import h_templates_harness_global_conditional_brownfield_md from './templates/harness/global/conditional/brownfield.md';
import h_templates_harness_design_api_design_md from './templates/harness/design/api-design.md';
import h_templates_harness_model_architecture_md from './templates/harness/model/architecture.md';
import h_templates_harness_model_domain_modeling_md from './templates/harness/model/domain-modeling.md';
import h_templates_harness_model_view_modeling_md from './templates/harness/model/view-modeling.md';
import h_templates_harness_requirement_requirements_md from './templates/harness/requirement/requirements.md';

export interface BundledHarnessEntry { relPath: string; title: string; body: string; }

export const bundledHarnessBodies: Record<string, { title: string; body: string }> = {
  'apply/implementation.md': { title: '代码实现约束', body: h_templates_harness_apply_implementation_md },
  'arch/application.md': { title: '应用架构约束', body: h_templates_harness_arch_application_md },
  'arch/business.md': { title: '业务架构约束', body: h_templates_harness_arch_business_md },
  'arch/frontend.md': { title: '前端架构约束', body: h_templates_harness_arch_frontend_md },
  'constitution.md': { title: '约束资产宪法', body: h_templates_harness_constitution_md },
  'global/README.md': { title: '全局约束目录说明', body: h_templates_harness_global_readme_md },
  'global/always/interactive-interaction.md': {
    title: '互动式交互纪律',
    body: h_templates_harness_global_always_interactive_interaction_md,
  },
  'global/conditional/brownfield.md': {
    title: '棕地项目约束',
    body: h_templates_harness_global_conditional_brownfield_md,
  },
  'design/api-design.md': { title: 'API 设计约束', body: h_templates_harness_design_api_design_md },
  'model/architecture.md': { title: '领域建模架构约束', body: h_templates_harness_model_architecture_md },
  'model/domain-modeling.md': { title: '领域建模约束', body: h_templates_harness_model_domain_modeling_md },
  'model/view-modeling.md': { title: 'View Model 建模约束', body: h_templates_harness_model_view_modeling_md },
  'requirement/requirements.md': { title: '需求约束', body: h_templates_harness_requirement_requirements_md },
};
