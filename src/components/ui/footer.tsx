import { ArrowUpRight, Clock3, Globe2, Mail, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RuixenGradientFooter } from './ruixen-gradient-footer'

const email = 'lhl20040919@gmail.com'

export default function FooterSection() {
  return (
    <RuixenGradientFooter className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="footer-intro">
            <Link to="/" className="footer-brand" aria-label="返回浩迹首页">
              <span className="footer-brand-copy" aria-hidden="true">
                <span className="footer-brand-cn">浩迹</span>
                <span className="footer-brand-en">HaoTrace</span>
              </span>
              <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <p>把想不起的那句话，重新找回来。</p>
            <span className="footer-local-note">
              <Sparkles size={12} strokeWidth={1.7} aria-hidden="true" />
              本地优先 · 记忆留在浏览器里
            </span>
          </div>

          <div className="footer-link-columns">
            <div className="footer-link-group">
              <span className="footer-link-label">Explore</span>
              <nav aria-label="探索导航">
                <Link to="/">开始搜索</Link>
                <Link to="/timeline">记忆时间线</Link>
              </nav>
            </div>

            <div className="footer-link-group">
              <span className="footer-link-label">Connect</span>
              <nav aria-label="联系导航">
                <a href={`mailto:${email}`}>联系作者</a>
                <a href={`mailto:${email}`} className="footer-email-link">{email}</a>
              </nav>
            </div>
          </div>

          <div className="site-footer-icon-links" aria-label="相关入口">
            <Link to="/" aria-label="HaoTrace 官网" title="HaoTrace 官网">
              <Globe2 size={17} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link to="/timeline" aria-label="记忆时间线" title="记忆时间线">
              <Clock3 size={17} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <a href={`mailto:${email}`} aria-label={`发送邮件至 ${email}`} title={email}>
              <Mail size={17} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="site-footer-meta">
          <span>作者：多吉扎西</span>
          <span className="footer-meta-dot">·</span>
          <span>© {new Date().getFullYear()} HaoTrace</span>
          <span className="footer-meta-status"><i aria-hidden="true" /> All memories local</span>
        </div>
      </div>
    </RuixenGradientFooter>
  )
}
