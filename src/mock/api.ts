import type { Clue, StatsSummary, HandleRecord, HandoverRecord, OpenClue, TrendPoint, SpreadNode, RiskAdjustRecord, TimelineEvent } from '@/types';

const now = new Date();

function hoursAgo(h: number): string {
  return new Date(now.getTime() - h * 3600 * 1000).toISOString();
}

function timeAgoText(h: number): string {
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} 分钟前`;
  if (h < 24) return `${Math.round(h)} 小时前`;
  return `${Math.round(h / 24)} 天前`;
}

function makeTrendData(base = 30, hours = 24): TrendPoint[] {
  const arr: TrendPoint[] = [];
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const hh = t.getHours().toString().padStart(2, '0') + ':00';
    const factor = 1 + Math.sin(i / 3) * 0.4 + Math.random() * 0.3;
    arr.push({
      time: hh,
      forwards: Math.round(base * factor * 1.2),
      comments: Math.round(base * factor * 0.8),
      likes: Math.round(base * factor * 2.5),
    });
    base += 3;
  }
  return arr;
}

function makeSpreadNodes(): SpreadNode[] {
  return [
    { id: 's1', level: 0, platform: 'weibo', username: '爆料大V', followers: 5200000, forwards: 12800, isKey: true },
    { id: 's2', level: 1, platform: 'weibo', username: '新闻速递号', followers: 1800000, forwards: 3200, isKey: true },
    { id: 's3', level: 1, platform: 'wechat', username: '本地观察', followers: 680000, forwards: 890 },
    { id: 's4', level: 2, platform: 'douyin', username: '街头拍客A', followers: 450000, forwards: 560 },
    { id: 's5', level: 2, platform: 'zhihu', username: '行业观察员', followers: 230000, forwards: 180 },
    { id: 's6', level: 2, platform: 'tieba', username: '热心网友', followers: 8000, forwards: 42 },
    { id: 's7', level: 3, platform: 'news', username: '某新闻门户', followers: 0, forwards: 2100, isKey: true },
  ];
}

function makeAdjustHistory(): RiskAdjustRecord[] {
  return [
    { id: 'r1', fromLevel: 'watch', toLevel: 'warn', reason: 'policy_misread', remark: '转发量在1小时内翻3倍，需密切关注', operator: '张磊', time: hoursAgo(2).slice(0, 16).replace('T', ' ') },
    { id: 'r2', fromLevel: 'warn', toLevel: 'escalate', reason: 'collective_demand', remark: '登上本地热搜榜第5位', operator: '李明', time: hoursAgo(0.8).slice(0, 16).replace('T', ' ') },
  ];
}

function makeTimeline(): TimelineEvent[] {
  return [
    { id: 't1', stage: 'found', title: '线索自动发现', detail: '系统监测到敏感关键词聚合，触发预警', time: hoursAgo(4.5).slice(0, 16).replace('T', ' '), operator: 'AI监测系统' },
    { id: 't2', stage: 'analyze', title: '风险研判完成', detail: 'AI研判：传播速度异常，建议升级为预警', time: hoursAgo(4.2).slice(0, 16).replace('T', ' '), operator: 'AI分析引擎' },
    { id: 't3', stage: 'analyze', title: '人工复核确认', detail: '值班员张磊复核后确认风险，调整为预警等级', time: hoursAgo(4).slice(0, 16).replace('T', ' '), operator: '张磊' },
    { id: 't4', stage: 'contact', title: '联系涉事单位', detail: '已电话联系市市场监管局舆情科，对方表示正在核实', time: hoursAgo(3).slice(0, 16).replace('T', ' '), operator: '张磊' },
    { id: 't5', stage: 'contact', title: '单位回复反馈', detail: '涉事企业已获悉舆情，正在准备官方回应，预计2小时内发布', time: hoursAgo(1.5).slice(0, 16).replace('T', ' '), operator: '王芳' },
  ];
}

export const MOCK_CLUES: Clue[] = [
  {
    id: 'C20260619-001',
    platform: 'weibo',
    author: '本地爆料人',
    riskLevel: 'escalate',
    title: '某连锁餐饮品牌后厨卫生状况堪忧 视频曝光引发众怒',
    summary: '微博用户@本地爆料人 发布视频，显示某知名连锁餐饮品牌门店后厨存在严重卫生问题，包括食材随意堆放、员工操作不规范等。视频发布6小时内转发超2万，评论超8000条，负面情绪占比89%，已登上本地热搜榜第3位。',
    originalContent: '今天去XX路那家XX餐厅吃饭，刚好路过后厨门口，看到的一幕我真的惊呆了……里面的食材就这么扔在地上，师傅们连手套都不戴直接处理食物，洗碗池里的水都是黑的还在继续洗盘子！我拍了视频，大家自己看吧！以后再也不敢去了！！！#食品安全# #XX餐厅曝光#',
    keywords: ['餐饮卫生', '食品安全', '后厨曝光', '连锁品牌', '本地热搜'],
    forwardSpeed: 328,
    emotion: 'negative',
    similarCount: 156,
    publishedAt: hoursAgo(6.2),
    timeAgo: timeAgoText(6.2),
    originalUrl: 'https://weibo.com/example/123456',
    trendData: makeTrendData(50, 24),
    spreadNodes: makeSpreadNodes(),
    adjustHistory: makeAdjustHistory(),
  },
  {
    id: 'C20260619-002',
    platform: 'douyin',
    author: '城市拍客小李',
    riskLevel: 'warn',
    title: '地铁高峰期故障停运 乘客滞留车厢超40分钟',
    summary: '抖音用户@城市拍客小李 发布多条视频，显示早高峰时段地铁2号线突发故障，列车停在隧道中，乘客滞留超过40分钟，部分乘客出现身体不适。视频点赞超5万，评论区乘客纷纷吐槽运营方应急措施不力。',
    keywords: ['地铁故障', '公共交通', '应急处置', '高峰期', '乘客滞留'],
    forwardSpeed: 156,
    emotion: 'negative',
    similarCount: 42,
    publishedAt: hoursAgo(3.5),
    timeAgo: timeAgoText(3.5),
    originalUrl: 'https://douyin.com/example/789012',
    trendData: makeTrendData(35, 12),
    spreadNodes: makeSpreadNodes(),
  },
  {
    id: 'C20260619-003',
    platform: 'zhihu',
    author: '匿名用户',
    riskLevel: 'warn',
    title: '某楼盘交付质量问题频出 业主集体维权',
    summary: '知乎话题"如何看待XX小区交付品质缩水？"热度飙升，多名业主分享收房时发现的质量问题，包括墙体开裂、漏水、装修材料与样板间严重不符等。已有超过200名业主签署联名信要求开发商整改。',
    keywords: ['楼盘交付', '业主维权', '房屋质量', '开发商', '房产纠纷'],
    forwardSpeed: 89,
    emotion: 'negative',
    similarCount: 28,
    publishedAt: hoursAgo(12),
    timeAgo: timeAgoText(12),
    trendData: makeTrendData(20, 24),
  },
  {
    id: 'C20260619-004',
    platform: 'news',
    author: '城市晚报',
    riskLevel: 'watch',
    title: '本市中考分数线公布 多所高中扩招15%',
    summary: '市教育局召开新闻发布会，正式公布2026年中考录取分数线。今年全市普通高中计划扩招15%，新增学位3200个，职业教育招生比例保持42%。整体舆情正面，家长群体反应积极。',
    keywords: ['中考', '教育政策', '扩招', '分数线', '普通高中'],
    forwardSpeed: 23,
    emotion: 'positive',
    similarCount: 12,
    publishedAt: hoursAgo(5),
    timeAgo: timeAgoText(5),
  },
  {
    id: 'C20260619-005',
    platform: 'wechat',
    author: '生活服务通',
    riskLevel: 'watch',
    title: '本周六将迎来入夏最强降雨 局部地区有大暴雨',
    summary: '气象部门发布重要天气预警，本周六我市将迎入夏以来最强降雨过程，预计累计雨量80-150毫米，局部地区可达200毫米。市防汛办已启动四级应急响应，提醒市民减少外出。',
    keywords: ['暴雨预警', '天气预警', '防汛', '应急响应', '周末天气'],
    forwardSpeed: 45,
    emotion: 'neutral',
    similarCount: 34,
    publishedAt: hoursAgo(2),
    timeAgo: timeAgoText(2),
  },
  {
    id: 'C20260619-006',
    platform: 'tieba',
    author: '热心市民王',
    riskLevel: 'escalate',
    title: '化工园区异味扰民持续一月 环保部门介入调查',
    summary: '百度贴吧"XX市吧"多位居民反映，化工园区夜间排放刺激性气味问题已持续近一个月，严重影响居民正常生活，部分老人小孩出现呼吸道不适症状。已收集到170余条居民投诉记录，环保部门已成立专案组。',
    originalContent: '我们小区离那个化工园区也就两公里，这一个月来几乎每天半夜都能闻到一股刺鼻的味道，像什么东西烧糊了一样。家里老人最近一直咳嗽，小孩也得了支气管炎，去医院看了医生说跟空气质量有关系。我们群里已经有一百多户都反映了这个问题，也给12345打了无数次电话，一直没解决。今天又有邻居拍到晚上厂子的烟囱冒黑烟，真是太气人了！希望有关部门能真正管管！',
    keywords: ['化工污染', '环保投诉', '异味扰民', '12345投诉', '居民健康'],
    forwardSpeed: 210,
    emotion: 'negative',
    similarCount: 89,
    publishedAt: hoursAgo(8),
    timeAgo: timeAgoText(8),
    trendData: makeTrendData(40, 24),
    spreadNodes: makeSpreadNodes(),
    adjustHistory: makeAdjustHistory().slice(0, 1),
  },
];

export const MOCK_STATS: StatsSummary = {
  watchCount: 128,
  warnCount: 36,
  escalateCount: 7,
  totalCount: 171,
  trend24h: makeTrendData(60, 24),
  platformDist: [
    { platform: 'weibo', value: 58 },
    { platform: 'wechat', value: 34 },
    { platform: 'douyin', value: 42 },
    { platform: 'tieba', value: 15 },
    { platform: 'zhihu', value: 12 },
    { platform: 'news', value: 10 },
  ],
};

export function getMockClue(id: string): Clue | undefined {
  return MOCK_CLUES.find(c => c.id === id);
}

export function getHandleRecord(clueId: string): Promise<HandleRecord> {
  return Promise.resolve(getMockHandleRecord(clueId));
}

export function saveHandleRecord(record: HandleRecord): Promise<HandleRecord> {
  return Promise.resolve(record);
}

export function getRecentHandovers(limit = 10): Promise<HandoverRecord[]> {
  return Promise.resolve(MOCK_HANDOVER_HISTORY.slice(0, limit));
}

export function getUnclosedClues(): Promise<Clue[]> {
  const openIds = new Set(MOCK_OPEN_CLUES.map(o => o.id));
  return Promise.resolve(MOCK_CLUES.filter(c => openIds.has(c.id)));
}

export function getMockHandleRecord(clueId: string): HandleRecord {
  return {
    id: `HR-${clueId}`,
    clueId,
    stage: 'contact',
    contactUnits: [
      { id: 'cu1', unitName: '市市场监督管理局', contactPerson: '赵科长', phone: '0571-8888****', result: '已获悉情况，正在派执法人员前往现场核实', status: 'replied' },
      { id: 'cu2', unitName: '市卫生健康委员会', contactPerson: '孙主任', phone: '0571-8765****', result: '餐饮卫生监管职能主要在市监局，卫健委可配合抽检', status: 'contacted' },
      { id: 'cu3', unitName: '涉事餐饮集团公关部', contactPerson: '周经理', phone: '138****5678', result: '', status: 'pending' },
    ],
    responses: [
      { id: 'rr1', platform: 'weibo', publishedAt: hoursAgo(1).slice(0, 16).replace('T', ' '), content: '针对今日网络曝光的我司XX门店后厨卫生问题，集团高度重视，已成立专项调查组，第一时间对涉事门店进行停业整改，并对全部门店开展卫生排查。调查结果将在24小时内公布，接受社会监督。对于此次事件给消费者带来的担忧，我们深表歉意。', auditStatus: 'reviewing', views: 128500 },
      { id: 'rr2', platform: 'wechat', publishedAt: hoursAgo(0.5).slice(0, 16).replace('T', ' '), content: '【情况通报】市市场监管局已注意到相关舆情，执法人员已赶赴涉事门店进行现场检查，查封相关区域并抽样送检。后续调查处理进展将第一时间向社会公开。', auditStatus: 'approved', views: 85600 },
    ],
    verifyItems: [
      { id: 'vi1', description: '核实涉事门店营业执照、食品经营许可证是否齐全有效', owner: '执法一队 陈刚', deadline: hoursAgo(-4).slice(0, 16).replace('T', ' '), priority: 'urgent', progress: 80 },
      { id: 'vi2', description: '采集后厨食材样本送检，确认是否存在食品安全问题', owner: '质检中心 林霞', deadline: hoursAgo(-8).slice(0, 16).replace('T', ' '), priority: 'high', progress: 40 },
      { id: 'vi3', description: '调取门店近30天监控录像，核查卫生问题是否为长期存在', owner: '执法二队 刘强', deadline: hoursAgo(-12).slice(0, 16).replace('T', ' '), priority: 'medium', progress: 15 },
    ],
    timeline: makeTimeline(),
    updatedAt: hoursAgo(0.3).slice(0, 16).replace('T', ' '),
  };
}

export const MOCK_OPEN_CLUES: OpenClue[] = [
  { id: 'C20260619-001', riskLevel: 'escalate', keywords: ['餐饮卫生', '后厨曝光', '连锁品牌'], foundAt: hoursAgo(6.2), timeAgo: timeAgoText(6.2), stage: 'contact', todo: '等待市监局现场检查报告，督促涉事企业发布官方回应' },
  { id: 'C20260619-006', riskLevel: 'escalate', keywords: ['化工污染', '异味扰民', '环保投诉'], foundAt: hoursAgo(8), timeAgo: timeAgoText(8), stage: 'respond', todo: '跟进环保部门调查进展，组织多部门联合处置方案' },
  { id: 'C20260619-002', riskLevel: 'warn', keywords: ['地铁故障', '乘客滞留', '应急处置'], foundAt: hoursAgo(3.5), timeAgo: timeAgoText(3.5), stage: 'verify', todo: '核验地铁运营方整改措施，确认线路运行恢复正常' },
  { id: 'C20260619-003', riskLevel: 'warn', keywords: ['楼盘交付', '业主维权', '房屋质量'], foundAt: hoursAgo(12), timeAgo: timeAgoText(12), stage: 'contact', todo: '协调住建局介入，组织业主代表与开发商协商会议' },
];

export const MOCK_HANDOVER_HISTORY: HandoverRecord[] = [
  {
    id: 'H2026061901',
    shiftStarter: '张伟',
    shiftEnder: '张磊',
    handedAt: hoursAgo(8).slice(0, 16).replace('T', ' '),
    foundCount: 42,
    handledCount: 38,
    escalateCount: 2,
    avgResponseTime: 18,
    remark: '早班期间舆情总体平稳，C20260619-006号线索需重点关注化工园区异味问题，居民投诉较多。',
  },
  {
    id: 'H2026061802',
    shiftStarter: '李明',
    shiftEnder: '王芳',
    handedAt: hoursAgo(20).slice(0, 16).replace('T', ' '),
    foundCount: 56,
    handledCount: 52,
    escalateCount: 1,
    avgResponseTime: 22,
    remark: '晚班期间接转早班遗留线索3条，均已跟进完毕。晚间9点左右出现一波高考相关话题热度，已研判无风险。',
  },
  {
    id: 'H2026061801',
    shiftStarter: '王芳',
    shiftEnder: '李明',
    handedAt: hoursAgo(32).slice(0, 16).replace('T', ' '),
    foundCount: 35,
    handledCount: 35,
    escalateCount: 0,
    avgResponseTime: 15,
    remark: '交接班顺利，无未闭环线索。',
  },
];
