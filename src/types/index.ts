export type RiskLevel = 'watch' | 'warn' | 'escalate';

export type EmotionType = 'positive' | 'neutral' | 'negative';

export type PlatformType = 'weibo' | 'wechat' | 'douyin' | 'tieba' | 'zhihu' | 'news';

export type EventStage = 'found' | 'analyze' | 'contact' | 'respond' | 'verify' | 'closed';

export const RISK_NAMES: Record<RiskLevel, string> = {
  watch: '关注',
  warn: '预警',
  escalate: '升级',
};

export const PLATFORM_NAMES: Record<PlatformType, string> = {
  weibo: '微博',
  wechat: '微信',
  douyin: '抖音',
  tieba: '百度贴吧',
  zhihu: '知乎',
  news: '新闻门户',
};

export const STAGE_NAMES: Record<EventStage, string> = {
  found: '线索发现',
  analyze: '风险研判',
  contact: '部门对接',
  respond: '舆情响应',
  verify: '效果核验',
  closed: '归档闭环',
};

export const REASON_NAMES: Record<string, string> = {
  policy_misread: '政策误读',
  official_speech: '干部言论',
  collective_demand: '群体性诉求',
  rumor_spread: '谣言传播',
  media_report: '媒体报道',
  cross_region: '跨区传播',
  sensitive_anniversary: '敏感节点',
  other: '其他',
};

export interface TrendPoint {
  time: string;
  forwards: number;
  comments: number;
  likes: number;
}

export interface Clue {
  id: string;
  platform: PlatformType;
  author: string;
  riskLevel: RiskLevel;
  title: string;
  summary: string;
  originalContent?: string;
  keywords: string[];
  forwardSpeed: number;
  emotion: EmotionType;
  similarCount: number;
  publishedAt: string;
  publishTime?: string;
  firstDiscoverTime?: string;
  timeAgo: string;
  originalUrl?: string;
  trendData?: TrendPoint[];
  trend?: TrendPoint[];
  spreadNodes?: SpreadNode[];
  adjustHistory?: RiskAdjustRecord[];
  isClosed?: boolean;
  currentStage?: EventStage;
}

export interface SpreadNode {
  id: string;
  level: number;
  platform: PlatformType;
  username: string;
  followers: number;
  forwards: number;
  isKey?: boolean;
  author?: string;
  followerCount?: number;
  forwardCount?: number;
  isKeyNode?: boolean;
}

export interface TimelineEvent {
  id: string;
  stage: EventStage;
  title: string;
  detail: string;
  time: string;
  operator: string;
}

export interface RiskAdjustRecord {
  id: string;
  fromLevel: RiskLevel;
  toLevel: RiskLevel;
  reason: string;
  remark: string;
  judgment?: string;
  operator: string;
  time?: string;
  operateTime?: string;
  clueId?: string;
}

export interface StatsSummary {
  watchCount: number;
  warnCount: number;
  escalateCount: number;
  totalCount: number;
  trend24h: TrendPoint[];
  platformDist: { platform: PlatformType; value: number }[];
}

export interface ContactUnit {
  id: string;
  unitName: string;
  contactPerson: string;
  phone: string;
  result: string;
  status: 'pending' | 'contacted' | 'replied' | 'escalated' | 'pending_reply' | 'no_response';
  contactTime?: string;
}

export interface ResponseRecord {
  id: string;
  platform: PlatformType | string;
  publishedAt: string;
  publishTime?: string;
  content: string;
  auditStatus: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'published';
  views: number;
  viewCount?: number;
}

export interface VerifyItem {
  id: string;
  description: string;
  owner: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  status?: string;
}

export interface HandleRecord {
  id: string;
  clueId: string;
  stage: EventStage;
  contactUnits: ContactUnit[];
  responses: ResponseRecord[];
  verifyItems: VerifyItem[];
  timeline: TimelineEvent[];
  updatedAt: string;
}

export const CONTACT_STATUS_NAMES: Record<string, string> = {
  pending: '待联系',
  contacted: '已联系',
  replied: '已回复',
  escalated: '已升级',
  pending_reply: '待回复',
  no_response: '无响应',
};

export const AUDIT_STATUS_NAMES: Record<string, string> = {
  draft: '草稿',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '已驳回',
  published: '已发布',
};

export const PRIORITY_NAMES: Record<VerifyItem['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export interface KeyHandoverItem {
  clueId: string;
  keywords: string[];
  riskLevel: RiskLevel;
  instruction: string;
}

export interface HandoverRecord {
  id: string;
  shiftStarter: string;
  shiftEnder: string;
  handedAt: string;
  foundCount: number;
  handledCount: number;
  escalateCount: number;
  avgResponseTime: number;
  remark: string;
  keyItems?: KeyHandoverItem[];
  shiftName?: string;
  outgoingOperator?: string;
  incomingOperator?: string;
  handoverTime?: string;
  statistics?: {
    totalFound: number;
    totalDisposed: number;
    totalEscalated: number;
    avgResponseMinutes: number;
    platformBreakdown: Record<string, number>;
  };
}

export interface OpenClue {
  id: string;
  riskLevel: RiskLevel;
  keywords: string[];
  foundAt: string;
  timeAgo: string;
  stage: EventStage;
  todo: string;
}
