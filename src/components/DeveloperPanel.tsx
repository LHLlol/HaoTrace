import { Check, Download, FileText, Github, UploadCloud } from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import { parseChatText, type ImportedChatPayload } from '../lib/data/importChatText'

interface DeveloperPanelProps {
  onImport: (payload: ImportedChatPayload) => Promise<void>
}

type ImportStatus = 'idle' | 'reading' | 'success' | 'error'

export default function DeveloperPanel({ onImport }: DeveloperPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | undefined>()
  const [payload, setPayload] = useState<ImportedChatPayload | undefined>()
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done' | 'unavailable'>('idle')

  function chooseFile() {
    inputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0])
    setPayload(undefined)
    setStatus('idle')
    setErrorMessage('')
    setSyncState('idle')
  }

  async function submitFile() {
    if (!file) return
    setStatus('reading')
    setErrorMessage('')
    try {
      const nextPayload = parseChatText(await file.text())
      await onImport(nextPayload)
      setPayload(nextPayload)
      setStatus('success')

      const endpoint = (import.meta.env as ImportMetaEnv & { VITE_GITHUB_SYNC_ENDPOINT?: string }).VITE_GITHUB_SYNC_ENDPOINT
      if (!endpoint) {
        setSyncState('unavailable')
        return
      }

      setSyncState('syncing')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPayload),
      })
      if (!response.ok) throw new Error(`GitHub 同步接口返回 ${response.status}`)
      setSyncState('done')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'TXT 导入失败')
    }
  }

  function downloadPayload() {
    if (!payload) return
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'haotrace-conversations.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="developer-panel" aria-label="开发者模式 TXT 导入">
      <div className="developer-panel-header">
        <div>
          <span className="developer-panel-kicker"><Github size={12} aria-hidden="true" /> Developer mode</span>
          <h2>只接收 TXT 记忆档案</h2>
          <p>输入内容不会触发搜索反馈，提交 TXT 后才会解析并更新当前索引。</p>
        </div>
        <span className="developer-panel-badge">/// active</span>
      </div>

      <input ref={inputRef} className="developer-file-input" type="file" accept=".txt,text/plain" onChange={handleFileChange} />

      <div className="developer-upload-row">
        <button type="button" className="developer-file-button" onClick={chooseFile}>
          <FileText size={15} aria-hidden="true" />
          {file ? file.name : '选择聊天 TXT'}
        </button>
        <button type="button" className="developer-submit" disabled={!file || status === 'reading'} onClick={submitFile}>
          <UploadCloud size={14} aria-hidden="true" />
          {status === 'reading' ? '正在同步' : '提交 TXT'}
        </button>
      </div>

      {status === 'success' && payload && (
        <div className="developer-import-result" role="status">
          <Check size={15} aria-hidden="true" />
          <span>已导入 {payload.importedMessageCount} 条消息 · {payload.conversations.length} 个片段</span>
          <button type="button" className="developer-download" onClick={downloadPayload}>
            <Download size={13} aria-hidden="true" /> 导出 JSON
          </button>
        </div>
      )}
      {status === 'error' && <p className="developer-error" role="alert">{errorMessage}</p>}
      {syncState === 'unavailable' && <p className="developer-sync-note">本地索引已更新；GitHub 自动同步需要配置 VITE_GITHUB_SYNC_ENDPOINT。</p>}
      {syncState === 'syncing' && <p className="developer-sync-note">正在等待 GitHub 同步接口确认。</p>}
      {syncState === 'done' && <p className="developer-sync-note success">GitHub 同步已确认。</p>}
    </section>
  )
}
