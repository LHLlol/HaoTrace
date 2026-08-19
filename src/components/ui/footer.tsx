import { Clock3, Globe2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const email = 'lhl20040919@gmail.com'

export default function FooterSection() {
  return (
    <footer className="site-footer" aria-label="网站页脚">
      <div className="site-footer-inner">
        <Link to="/" className="footer-brand" aria-label="返回浩迹首页">
          <span className="footer-brand-copy" aria-hidden="true">
            <span className="footer-brand-cn">浩迹</span>
            <span className="footer-brand-en">HaoTrace</span>
          </span>
        </Link>

        <nav className="site-footer-nav" aria-label="页脚导航">
          <Link to="/">首页</Link>
          <Link to="/timeline">时间线</Link>
          <a href={`mailto:${email}`}>联系邮箱</a>
        </nav>

        <div className="site-footer-icon-links" aria-label="相关入口">
          <Link to="/" aria-label="HaoTrace 官网" title="HaoTrace 官网">
            <Globe2 size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link to="/timeline" aria-label="记忆时间线" title="记忆时间线">
            <Clock3 size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <a href={`mailto:${email}`} aria-label={`发送邮件至 ${email}`} title={email}>
            <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>

        <div className="site-footer-meta">
          <span>作者：多吉扎西</span>
          <span className="footer-meta-dot">·</span>
          <a href={`mailto:${email}`}>{email}</a>
          <span className="footer-meta-dot">·</span>
          <span>© {new Date().getFullYear()} HaoTrace</span>
        </div>
      </div>
    </footer>
  )
}
