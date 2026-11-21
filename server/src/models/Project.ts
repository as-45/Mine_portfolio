import { Schema, model, type InferSchemaType } from 'mongoose';
export const PROJECT_CATEGORIES = ['research', 'genai', 'backend', 'fullstack'] as const;

const decisionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const diagramNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

const diagramEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String, default: '' },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words joined by hyphens'],
    },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    category: {
      type: String,
      required: true,
      enum: PROJECT_CATEGORIES,
    },
    role: { type: String, default: '', trim: true },
    techStack: { type: [String], default: [] },
    problem: { type: String, default: '' },
    decisions: { type: [decisionSchema], default: [] },
    results: { type: [String], default: [] },
    links: {
      github: { type: String, default: '' },
      live: { type: String, default: '' },
      paper: { type: String, default: '' },
    },
    diagram: {
      nodes: { type: [diagramNodeSchema], default: [] },
      edges: { type: [diagramEdgeSchema], default: [] },
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

projectSchema.index({ published: 1, order: 1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema>;

export const Project = model('Project', projectSchema);
