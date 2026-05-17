import type { Persona } from '@/types/chat'

export const PERSONAS: Persona[] = [
  {
    id: 'productivity',
    name: 'Productivity Assistant',
    description: 'GTD, time-blocking, deep work, habit stacking, and focus systems',
    icon: '⚡',
    color: '#00fff5',
  },
  {
    id: 'customer-service',
    name: 'Customer Service Bot',
    description: 'Empathetic, solution-focused support for product and service issues',
    icon: '🎧',
    color: '#bf00ff',
  },
  {
    id: 'education',
    name: 'Education Tutor',
    description: 'Socratic teaching, concept breakdown, analogies, and quiz generation',
    icon: '📚',
    color: '#39ff14',
  },
  {
    id: 'travel',
    name: 'Travel Assistant',
    description: 'Destination guides, itinerary planning, visas, and local insider tips',
    icon: '✈️',
    color: '#ff6b35',
  },
  {
    id: 'coder',
    name: 'Code Assistant',
    description: 'Debugging, code review, system design, algorithms, and best practices',
    icon: '💻',
    color: '#00d4ff',
  },
  {
    id: 'health',
    name: 'Health & Wellness Coach',
    description: 'Nutrition, fitness plans, mental health strategies, and sleep optimization',
    icon: '🏃',
    color: '#ff4d6d',
  },
  {
    id: 'finance',
    name: 'Finance Advisor',
    description: 'Budgeting, investing, personal finance, and financial planning concepts',
    icon: '💰',
    color: '#ffd60a',
  },
  {
    id: 'legal',
    name: 'Legal Assistant',
    description: 'Plain-language explanations of legal concepts, contracts, and rights',
    icon: '⚖️',
    color: '#e0aaff',
  },
]
