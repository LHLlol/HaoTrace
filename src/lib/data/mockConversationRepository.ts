import type { Conversation, Message, Participant } from '../../types/conversation'
import type { ConversationRepository } from './conversationRepository'

type MessageSeed = {
  sender: Participant
  time: string
  content: string
  topics?: string[]
  emotion?: string[]
  tags?: string[]
}

function buildConversation(
  id: string,
  date: string,
  title: string,
  participants: Participant[],
  seeds: MessageSeed[],
  coverTone: Conversation['coverTone'],
): Conversation {
  const [year, month, day] = date.split('-').map(Number)
  const messages: Message[] = seeds.map((seed, index) => ({
    id: `${id}-${index + 1}`,
    conversationId: id,
    sender: seed.sender,
    content: seed.content,
    timestamp: `${date}T${seed.time}:00`,
    date,
    year,
    month,
    day,
    topics: seed.topics,
    emotion: seed.emotion,
    tags: seed.tags,
  }))

  return {
    id,
    title,
    participants,
    messages,
    startTime: messages[0].timestamp,
    endTime: messages[messages.length - 1].timestamp,
    coverTone,
    topics: [...new Set(messages.flatMap((message) => message.topics ?? []))],
  }
}

const conversations: Conversation[] = [
  buildConversation('sea-house', '2024-05-17', '关于以后住在哪里', ['我', '她'], [
    { sender: '她', time: '21:31', content: '最近感觉每天都好忙，连晚饭都像是在赶时间。', topics: ['生活', '压力'], emotion: ['疲惫'], tags: ['忙碌'] },
    { sender: '我', time: '21:33', content: '那以后想住在哪里？换个节奏会不会好一点。', topics: ['未来', '居住'], emotion: ['关心'], tags: ['以后', '生活'] },
    { sender: '她', time: '21:34', content: '其实我觉得以后住在海边挺好的。', topics: ['未来计划', '海边', '居住'], emotion: ['向往'], tags: ['海', '房子', '以后'] },
    { sender: '她', time: '21:35', content: '每天醒来可以看到海应该很舒服，家里还可以有一只猫。', topics: ['未来计划', '海边', '宠物'], emotion: ['憧憬'], tags: ['海', '猫'] },
    { sender: '我', time: '21:37', content: '那我每天负责买早餐，你负责挑窗帘。', topics: ['未来', '生活'], emotion: ['轻松'], tags: ['玩笑'] },
  ], 'blue'),
  buildConversation('late-night', '2024-03-02', '不要总是熬夜', ['我', '她'], [
    { sender: '我', time: '00:47', content: '刚把东西弄完，准备睡了。', topics: ['工作', '日常'], emotion: ['疲惫'], tags: ['凌晨'] },
    { sender: '她', time: '00:48', content: '你又熬夜？明天不是还要早起吗。', topics: ['睡眠', '关心'], emotion: ['担心'], tags: ['熬夜', '晚睡'] },
    { sender: '我', time: '00:49', content: '最后一点点，很快就好。', topics: ['工作'], emotion: ['嘴硬'], tags: ['熬夜'] },
    { sender: '她', time: '00:50', content: '我是真的不喜欢你总是熬夜，身体会先替你抗议的。', topics: ['睡眠', '关心'], emotion: ['认真', '担心'], tags: ['熬夜', '晚睡', '身体'] },
    { sender: '她', time: '00:51', content: '把电脑合上，明早我叫你起床。', topics: ['睡眠'], emotion: ['温柔'], tags: ['早起'] },
  ], 'coral'),
  buildConversation('job-comfort', '2024-08-26', '工作压力很大的那段时间', ['我', '她'], [
    { sender: '我', time: '18:22', content: '今天面试又没过，我开始怀疑是不是根本找不到适合自己的工作。', topics: ['工作', '找工作'], emotion: ['低落', '焦虑'], tags: ['面试', '工作压力'] },
    { sender: '她', time: '18:24', content: '你已经很认真地走了这么久，不要把一次结果当成对自己的判断。', topics: ['工作', '安慰'], emotion: ['安慰', '坚定'], tags: ['找工作', '压力'] },
    { sender: '我', time: '18:26', content: '可是每天醒来都觉得还有好多事情没做完。', topics: ['工作压力'], emotion: ['焦虑'], tags: ['压力'] },
    { sender: '她', time: '18:28', content: '那今天先不解决全部。先去吃饭，剩下的明天再陪你一起想。', topics: ['安慰', '生活'], emotion: ['温柔'], tags: ['吃饭', '压力'] },
    { sender: '我', time: '18:30', content: '好，今天可以只做一个不那么努力的人。', topics: ['工作', '安慰'], emotion: ['放松'], tags: ['休息'] },
  ], 'mint'),
  buildConversation('cat-first', '2023-11-11', '第一次认真聊到养猫', ['我', '她'], [
    { sender: '她', time: '16:02', content: '楼下那只橘猫今天又在门口睡觉，完全不怕人。', topics: ['宠物', '猫'], emotion: ['开心'], tags: ['猫', '橘猫'] },
    { sender: '我', time: '16:04', content: '它好像已经把那里当成自己的家了。', topics: ['宠物', '猫'], emotion: ['轻松'], tags: ['猫'] },
    { sender: '她', time: '16:07', content: '以后家里有只猫应该挺好的，回家会有东西等你。', topics: ['宠物', '未来计划'], emotion: ['向往'], tags: ['猫', '养猫', '家'] },
    { sender: '我', time: '16:09', content: '那要养一只会不会很麻烦？', topics: ['宠物'], emotion: ['好奇'], tags: ['养猫'] },
    { sender: '她', time: '16:11', content: '麻烦一点也没关系，先把猫砂盆的位置想好。', topics: ['宠物', '生活'], emotion: ['认真'], tags: ['养猫'] },
  ], 'yellow'),
  buildConversation('japan-plan', '2024-07-09', '想去日本看一场夏天', ['我', '她'], [
    { sender: '我', time: '12:18', content: '如果今年真的能空出一周，你最想去哪里？', topics: ['旅行', '未来计划'], emotion: ['期待'], tags: ['旅行'] },
    { sender: '她', time: '12:20', content: '想去日本，不一定要去很多地方，找个安静的小镇也行。', topics: ['旅行', '日本'], emotion: ['向往'], tags: ['日本', '旅行'] },
    { sender: '我', time: '12:21', content: '夏天去的话，可以看烟花和海边的电车。', topics: ['旅行', '日本'], emotion: ['期待'], tags: ['夏天', '烟花'] },
    { sender: '她', time: '12:23', content: '对，晚上穿着浴衣去看烟花，听起来就很像电影。', topics: ['旅行', '日本'], emotion: ['浪漫'], tags: ['夏天', '烟花'] },
  ], 'pink'),
  buildConversation('food-fight', '2023-09-16', '因为晚饭去哪儿的小争执', ['我', '她'], [
    { sender: '我', time: '19:06', content: '都走到这里了，还是吃火锅吧。', topics: ['吃饭'], emotion: ['随意'], tags: ['晚饭', '火锅'] },
    { sender: '她', time: '19:07', content: '可是我今天真的不想吃辣的，刚刚已经说过了。', topics: ['吃饭', '争执'], emotion: ['委屈'], tags: ['晚饭', '火锅'] },
    { sender: '我', time: '19:09', content: '我只是觉得每次都要重新决定很累。', topics: ['吃饭', '争执'], emotion: ['烦躁'], tags: ['吵架'] },
    { sender: '她', time: '19:11', content: '你看，你根本不是在问我想吃什么。', topics: ['吃饭', '争执', '关系'], emotion: ['生气'], tags: ['吵架', '争执'] },
    { sender: '我', time: '19:15', content: '对不起，我们去吃你想吃的，今天不为一顿饭吵架。', topics: ['吃饭', '和好'], emotion: ['道歉'], tags: ['和好'] },
  ], 'coral'),
  buildConversation('birthday-film', '2025-01-22', '生日那天看的老电影', ['我', '她'], [
    { sender: '她', time: '20:03', content: '这部电影我小时候看过，结尾的时候哭得很厉害。', topics: ['电影', '生日'], emotion: ['怀旧'], tags: ['电影'] },
    { sender: '我', time: '20:05', content: '难怪你刚才一直提前猜剧情。', topics: ['电影'], emotion: ['轻松'], tags: ['电影'] },
    { sender: '她', time: '20:08', content: '我喜欢那种看完以后还会在心里待很久的电影。', topics: ['电影', '情绪'], emotion: ['柔软'], tags: ['电影', '喜欢'] },
    { sender: '我', time: '20:10', content: '那它现在又多了一层记忆了。生日快乐。', topics: ['电影', '生日'], emotion: ['温柔'], tags: ['生日'] },
  ], 'blue'),
  buildConversation('moving-home', '2025-04-03', '搬家之后的第一个晚上', ['我', '她'], [
    { sender: '我', time: '22:12', content: '新房间还有纸箱没有拆完，但窗边的光很好。', topics: ['搬家', '生活'], emotion: ['新鲜'], tags: ['房子', '搬家'] },
    { sender: '她', time: '22:14', content: '慢慢来，家不是一天就布置好的。', topics: ['搬家', '安慰'], emotion: ['安慰'], tags: ['房子', '家'] },
    { sender: '我', time: '22:17', content: '我想在阳台放一张很小的桌子，周末可以在那里喝咖啡。', topics: ['搬家', '生活'], emotion: ['期待'], tags: ['咖啡', '阳台'] },
    { sender: '她', time: '22:20', content: '还要留一个位置给未来那只猫晒太阳。', topics: ['搬家', '宠物', '未来计划'], emotion: ['玩笑', '向往'], tags: ['猫', '家'] },
  ], 'mint'),
  buildConversation('graduation', '2022-06-18', '毕业以后要去哪里', ['我', '她'], [
    { sender: '她', time: '23:02', content: '突然有点不想毕业，好像离开学校以后就没有明确的下一站了。', topics: ['毕业', '未来'], emotion: ['不安'], tags: ['毕业'] },
    { sender: '我', time: '23:04', content: '没有下一站也没关系，我们可以边走边决定。', topics: ['毕业', '安慰'], emotion: ['安慰'], tags: ['未来'] },
    { sender: '她', time: '23:07', content: '那以后如果去了不同的城市，还要记得常联系。', topics: ['毕业', '异地', '关系'], emotion: ['舍不得'], tags: ['异地', '毕业'] },
    { sender: '我', time: '23:10', content: '当然，隔着城市也可以分享每天发生的小事。', topics: ['异地', '关系'], emotion: ['坚定'], tags: ['异地'] },
  ], 'yellow'),
]

export const mockConversationRepository: ConversationRepository = {
  async listConversations() {
    return conversations
  },
  async getConversation(id: string) {
    return conversations.find((conversation) => conversation.id === id)
  },
}

export { conversations }
