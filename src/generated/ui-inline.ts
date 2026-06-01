export const UI_HTML = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Supa Palette</title>
    <style>
      :root {
        color: #17263f;
        background: #ffffff;
        font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
      }

      body {
        color: #17263f;
        overflow: hidden;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      button {
        border: 0;
      }

      .hidden {
        display: none !important;
      }

      .landing-screen {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        --pointer-x: 50%;
        --pointer-y: 42%;
      }

      .bg-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        min-height: 100%;
        background: linear-gradient(180deg, #e4dfff 0%, #ddd6ff 22%, #d8d0ff 46%, #e4deff 62%, #fbfbff 88%, #ffffff 100%);
      }

      .bg-grid,
      .bg-purple-haze,
      .bg-cursor-glow,
      .bg-flow-lines,
      .bg-left-fade,
      .bg-bottom-fade {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .bg-grid {
        background-image:
          linear-gradient(rgba(126, 104, 238, 0.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(126, 104, 238, 0.16) 1px, transparent 1px);
        background-size: 20% var(--flow-grid-size, 80px);
        background-position: 0 0;
      }

      .bg-purple-haze {
        background:
          linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(132, 109, 245, 0.05) 30%, rgba(132, 109, 245, 0.1) 58%, rgba(132, 109, 245, 0.14) 100%),
          linear-gradient(180deg, rgba(147, 130, 255, 0.06) 0%, rgba(147, 130, 255, 0.12) 38%, rgba(147, 130, 255, 0.06) 68%, rgba(255, 255, 255, 0) 100%);
      }

      .bg-cursor-glow {
        opacity: 0;
        background: radial-gradient(
          circle 850px at var(--pointer-x) var(--pointer-y),
          rgba(126, 87, 255, 0.34) 0%,
          rgba(148, 118, 255, 0.23) 28%,
          rgba(165, 142, 255, 0.12) 62%,
          rgba(148, 118, 255, 0.04) 76%,
          rgba(148, 118, 255, 0) 90%
        );
        mix-blend-mode: multiply;
        transition: opacity 0.18s ease;
      }

      .landing-screen.is-pointer-active .bg-cursor-glow {
        opacity: 1;
      }

      .bg-flow-lines {
        z-index: 2;
        overflow: hidden;
        --flow-duration: 5.6s;
      }

      .flow-track {
        position: absolute;
        opacity: 0.82;
      }

      .flow-track::after,
      .flow-track span {
        content: "";
        position: absolute;
        display: block;
        pointer-events: none;
      }

      .flow-track::after {
        border-radius: 999px;
      }

      .flow-track span {
        width: 13px;
        height: 13px;
        border-radius: 999px;
        background: rgba(204, 194, 255, 0.42);
        filter: blur(3px);
      }

      .flow-track-horizontal {
        left: 0;
        right: 0;
        top: var(--flow-horizontal-y, 674px);
        height: 16px;
      }

      .flow-track-horizontal::after {
        left: -36%;
        top: 6px;
        width: 34%;
        height: 3px;
        background: linear-gradient(90deg, rgba(166, 142, 255, 0) 0%, rgba(166, 142, 255, 0.42) 56%, rgba(166, 142, 255, 0.82) 100%);
        animation: flow-horizontal var(--flow-duration) linear infinite;
      }

      .flow-track-horizontal span {
        left: calc(34% - 6.5px);
        top: 1.5px;
        animation: flow-horizontal-dot var(--flow-duration) linear infinite;
      }

      .flow-track-vertical {
        top: 0;
        bottom: 0;
        left: var(--flow-vertical-x, calc(60% - 8px));
        width: 16px;
      }

      .flow-track-vertical::after {
        top: -28%;
        left: 6px;
        width: 3px;
        height: 26%;
        background: linear-gradient(180deg, rgba(166, 142, 255, 0) 0%, rgba(166, 142, 255, 0.42) 56%, rgba(166, 142, 255, 0.82) 100%);
        animation: flow-vertical var(--flow-duration) linear infinite;
      }

      .flow-track-vertical span {
        left: 1.5px;
        top: calc(26% - 6.5px);
        animation: flow-vertical-dot var(--flow-duration) linear infinite;
      }

      @keyframes flow-horizontal {
        0% {
          opacity: 0;
          transform: translateX(0);
        }
        12% {
          opacity: 0.92;
        }
        86% {
          opacity: 0.92;
        }
        100% {
          opacity: 0;
          transform: translateX(146vw);
        }
      }

      @keyframes flow-horizontal-dot {
        0% {
          opacity: 0;
          transform: translateX(-36vw);
        }
        12% {
          opacity: 1;
        }
        86% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translateX(110vw);
        }
      }

      @keyframes flow-vertical {
        0% {
          opacity: 0;
          transform: translateY(0);
        }
        12% {
          opacity: 0.88;
        }
        86% {
          opacity: 0.88;
        }
        100% {
          opacity: 0;
          transform: translateY(138vh);
        }
      }

      @keyframes flow-vertical-dot {
        0% {
          opacity: 0;
          transform: translateY(-28vh);
        }
        12% {
          opacity: 1;
        }
        86% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translateY(110vh);
        }
      }

      .bg-left-fade {
        width: 118px;
        right: auto;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 255, 255, 0.22) 38%, rgba(255, 255, 255, 0) 100%);
      }

      .bg-bottom-fade {
        inset: auto 0 0;
        height: 110px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.42) 58%, rgba(255, 255, 255, 0.9) 86%, #ffffff 100%);
      }

      .landing-content {
        position: relative;
        width: calc(100% - 24px);
        max-width: 380px;
        height: 100%;
        min-height: 100%;
        margin: 0 auto;
        padding: 48px 0 32px;
        z-index: 4;
        display: grid;
        align-content: center;
        gap: clamp(24px, 4.4vh, 34px);
      }

      .landing-card {
        width: 100%;
        min-height: auto;
        padding: 0 10px;
        border-radius: 0;
        background: transparent;
        border: 0;
        box-shadow: none;
        display: grid;
        align-content: start;
        justify-items: start;
        gap: 24px;
      }

      .landing-card-top {
        display: block;
        width: 100%;
      }

      .landing-brand {
        display: grid;
        gap: 0;
        justify-items: start;
      }

      .landing-brand-mark {
        position: relative;
        width: 78px;
        height: 78px;
        border-radius: 24px;
        background: radial-gradient(circle at 30% 28%, #8e7eff 0%, #7d64f6 34%, #4a3c88 72%, #30285d 100%);
        overflow: hidden;
        box-shadow: 0 14px 28px rgba(70, 52, 155, 0.2);
      }

      .landing-brand-mark::before {
        content: "";
        position: absolute;
        width: 50px;
        height: 30px;
        left: -6px;
        bottom: 12px;
        border-radius: 999px;
        background: linear-gradient(90deg, #f7f4ff 0%, #b69dff 100%);
        transform: rotate(-9deg);
        opacity: 0.95;
      }

      .landing-brand-mark::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 31px 21px, rgba(255, 255, 255, 0.96) 0 2.4px, transparent 3px),
          radial-gradient(circle at 43px 15px, rgba(255, 255, 255, 0.8) 0 1.9px, transparent 2.5px),
          linear-gradient(120deg, transparent 0 26%, rgba(255, 255, 255, 0.18) 26% 48%, transparent 48%);
        opacity: 0.92;
      }

      .landing-copy {
        display: grid;
        gap: 16px;
        width: 100%;
        max-width: 100%;
        justify-items: start;
        text-align: left;
      }

      .landing-copy h1 {
        margin: 0;
        color: #252338;
        font-size: clamp(30px, 6.8vw, 36px);
        line-height: 1.02;
        font-weight: 800;
        letter-spacing: -0.04em;
        max-width: 100%;
        text-wrap: balance;
      }

      .landing-copy p {
        margin: 0;
        color: rgba(37, 35, 56, 0.9);
        font-size: clamp(18px, 4vw, 20px);
        line-height: 1.44;
        max-width: 100%;
      }

      .landing-topbar {
        position: absolute;
        top: 18px;
        right: 14px;
        z-index: 5;
        display: flex;
        justify-content: flex-end;
      }

      .landing-language {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 24px;
        gap: 6px;
        padding: 0;
        color: #5f4cc6;
        font-size: 14px;
        font-weight: 700;
      }

      .landing-language select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        padding: 0;
        background: transparent;
        color: transparent;
        opacity: 0;
        cursor: pointer;
      }

      .landing-language-caret {
        width: 9px;
        height: 6px;
        color: currentColor;
        pointer-events: none;
      }

      .entry-wrap {
        position: static;
        z-index: 4;
        display: grid;
        gap: 10px;
        padding: 0 8px;
        margin-top: 8px;
      }

      .entry-button,
      .contact-author-button {
        width: 100%;
        min-height: clamp(40px, 6.8vh, 48px);
        border-radius: 6px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
      }

      .entry-button {
        background: linear-gradient(90deg, #6f57ef 0%, #7f5cff 100%);
        color: #ffffff;
        box-shadow: 0 12px 28px rgba(111, 87, 239, 0.22);
      }

      .contact-author-button {
        background: #f9f9fb;
        color: #343044;
        box-shadow: 0 8px 20px rgba(37, 35, 56, 0.04);
      }

      .contact-author-button:hover {
        background: #efeff6;
        box-shadow: 0 12px 26px rgba(37, 35, 56, 0.08);
      }

      @media (max-height: 640px) {
        .landing-content {
          padding-top: 36px;
          padding-bottom: 24px;
          gap: 18px;
        }
      }

      .entry-button:active,
      .contact-author-button:active {
        transform: translateY(1px);
      }

      .app-shell {
        height: 100%;
        min-height: 100%;
        padding: 12px;
        display: grid;
        gap: 12px;
        background: linear-gradient(180deg, #e8e0ff 0%, #efe9ff 16%, #f7f4ff 30%, #fbfbff 52%, #ffffff 100%);
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }

      .hero,
      .panel {
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(132, 109, 245, 0.14);
        box-shadow: 0 16px 40px rgba(83, 63, 176, 0.08);
      }

      .hero {
        padding: 20px;
        display: grid;
        gap: 14px;
      }

      .hero-topbar {
        display: grid;
        gap: 10px;
      }

      .hero-copy {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        max-width: 292px;
        margin: 0;
      }

      .hero h1 {
        margin: 0;
        font-size: 20px;
        line-height: 1.2;
      }

      .hero-copy-text {
        display: grid;
        gap: 12px;
        width: 100%;
        max-width: none;
        text-align: left;
        margin: 0;
      }

      .hero-text {
        margin: 0;
        color: #5d6f8a;
        font-size: 13px;
        line-height: 1.5;
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        max-width: 100%;
        min-height: 34px;
        padding: 7px 10px;
        border-radius: 9px;
        background: rgba(132, 109, 245, 0.12);
        color: #7150ea;
        font-size: 12px;
        line-height: 1.45;
        transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
      }

      .status-chip.error {
        width: 100%;
        background: #fff1f1;
        border: 1px solid rgba(220, 38, 38, 0.18);
        color: #dc2626;
        font-size: 13px;
        font-weight: 700;
      }

      .hero-actions {
        display: none;
      }

      .ghost-icon {
        min-width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(247, 243, 255, 0.96);
        color: #7150ea;
        cursor: pointer;
      }

      .hero-back {
        flex: 0 0 auto;
      }

      .panel {
        padding: 12px;
        display: grid;
        gap: 10px;
      }

      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .panel-head h2 {
        margin: 0;
        font-size: 17px;
        line-height: 1.25;
      }

      .image-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .image-card {
        overflow: hidden;
        border-radius: 16px;
        border: 1px solid rgba(132, 109, 245, 0.14);
        background: #fff;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .image-head {
        padding: 8px 10px;
        background: rgba(243, 239, 255, 0.92);
        border-bottom: 1px solid rgba(132, 109, 245, 0.1);
        font-size: 12px;
        color: #6f61a8;
      }

      .image-body {
        position: relative;
        display: block;
        padding: 4px;
        height: 188px;
      }

      .image-body img,
      .image-empty {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: grid;
        place-items: center;
        color: #7b8ba3;
        background: linear-gradient(45deg, rgba(132, 109, 245, 0.05) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(132, 109, 245, 0.05) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(132, 109, 245, 0.05) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(132, 109, 245, 0.05) 75%);
        background-size: 24px 24px;
        background-position: 0 0, 0 12px, 12px -12px, -12px 0;
        border-radius: 12px;
      }

      .image-body img {
        display: none;
      }

      .image-body.has-image img {
        display: block;
      }

      .image-body.has-image .image-empty,
      .image-body.has-image .image-card-action {
        display: none;
      }

      .image-card-action {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
      }

      .field-grid,
      .field {
        display: grid;
        gap: 6px;
      }

      .field-grid {
        grid-template-columns: 1fr;
      }

      .field span {
        font-size: 12px;
        color: #6f61a8;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid rgba(132, 109, 245, 0.16);
        border-radius: 14px;
        padding: 10px 12px;
        background: rgba(249, 247, 255, 0.96);
        color: inherit;
      }

      select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 36px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2317263f' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 12px 8px;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: #7150ea;
        box-shadow: 0 0 0 2px rgba(113, 80, 234, 0.14);
      }

      textarea {
        resize: vertical;
      }

      input:disabled,
      select:disabled,
      textarea:disabled,
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .primary,
      .ghost,
      .accent,
      .danger {
        border-radius: 10px;
        min-height: 38px;
        padding: 0 14px;
        border: 1px solid rgba(132, 109, 245, 0.16);
        cursor: pointer;
      }

      .text-button {
        padding: 0;
        min-height: auto;
        border: 0;
        background: transparent;
        color: #9a94b4;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .text-button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .primary {
        background: #1f2b44;
        color: #fff;
      }

      .ghost {
        background: #fff;
        color: #17263f;
      }

      .accent {
        background: #7150ea;
        color: #fff;
        border-color: #7150ea;
      }

      .danger {
        background: #ef4444;
        color: #fff;
        border-color: #ef4444;
      }

      .action-row,
      .report-head-actions,
      .issue-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .report-head-actions {
        flex-wrap: nowrap;
        justify-content: flex-end;
      }

      .report-head-actions .ghost,
      .report-head-actions .accent {
        white-space: nowrap;
      }

      .action-row .primary {
        width: 100%;
      }

      .empty-block {
        padding: 14px;
        border-radius: 16px;
        background: rgba(247, 243, 255, 0.92);
        color: #6a7b94;
        text-align: center;
        font-size: 14px;
      }

      #reportContainer {
        display: grid;
        gap: 14px;
      }

      .report-summary {
        display: grid;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 18px;
        background: rgba(247, 243, 255, 0.92);
      }

      .report-summary p {
        margin: 0;
        font-size: 14px;
        line-height: 1.55;
      }

      .risk-pill,
      .severity {
        width: fit-content;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 11px;
      }

      .risk-pill.high,
      .severity.high {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }

      .risk-pill.medium,
      .severity.medium {
        background: rgba(245, 158, 11, 0.16);
        color: #b36a05;
      }

      .risk-pill.low,
      .severity.low {
        background: rgba(47, 118, 210, 0.12);
        color: #2f76d2;
      }

      .issue-list {
        display: grid;
        gap: 14px;
      }

      .issue-card {
        padding: 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(132, 109, 245, 0.14);
        display: grid;
        gap: 12px;
      }

      .issue-card-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
      }

      .issue-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .issue-title-row h3 {
        min-width: 0;
      }

      .issue-action {
        border-radius: 10px;
        min-height: 32px;
        padding: 0 12px;
        border: 1px solid transparent;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }

      .issue-action.high {
        background: #ef4444;
      }

      .issue-action.medium {
        background: #f59e0b;
      }

      .issue-action.low {
        background: #2f76d2;
      }

      .issue-card h3,
      .issue-card p {
        margin: 0;
      }

      .issue-card h3 {
        font-size: 16px;
        line-height: 1.4;
      }

      .issue-description {
        width: 100%;
        padding: 12px 13px;
        border-radius: 12px;
        background: rgba(246, 241, 255, 0.88);
        color: #42526b;
        font-size: 14px;
        line-height: 1.7;
      }

      .issue-field-list {
        display: grid;
        gap: 9px;
      }

      .issue-field {
        display: grid;
        gap: 4px;
      }

      .issue-field-label {
        width: fit-content;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(113, 80, 234, 0.1);
        color: #7150ea;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.5;
      }

      .issue-field-body {
        color: #42526b;
        font-size: 14px;
        line-height: 1.65;
      }

      .issue-paragraphs {
        display: grid;
        gap: 8px;
      }

      .issue-paragraphs p {
        margin: 0;
      }

      .issue-recommendation {
        color: #5a4ab8;
        font-size: 14px;
        line-height: 1.65;
      }

      @media (max-width: 360px) {
        .image-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="landing-screen" id="landingScreen">
      <div class="bg-canvas">
        <div class="bg-grid"></div>
        <div class="bg-purple-haze"></div>
        <div class="bg-cursor-glow"></div>
        <div class="bg-flow-lines" aria-hidden="true">
          <div class="flow-track flow-track-horizontal"><span></span></div>
          <div class="flow-track flow-track-vertical"><span></span></div>
        </div>
        <div class="bg-left-fade"></div>
        <div class="bg-bottom-fade"></div>
      </div>
      <div class="landing-topbar">
        <div class="landing-language">
          <span id="landingLanguageLabel"></span>
          <svg class="landing-language-caret" viewBox="0 0 9 6" fill="none" aria-hidden="true">
            <path d="M1 1.25L4.5 4.75L8 1.25" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <select id="landingLanguageSelect" aria-label="Language"></select>
        </div>
      </div>
      <div class="landing-content">
        <section class="landing-card">
          <div class="landing-card-top">
            <div class="landing-brand">
              <div class="landing-brand-mark" aria-hidden="true"></div>
            </div>
          </div>
          <div class="landing-copy">
            <h1 id="landingTitle"></h1>
            <p id="landingText"></p>
          </div>
        </section>
        <div class="entry-wrap">
          <button class="entry-button" id="enterAppButton">进入功能区</button>
          <button class="contact-author-button" id="contactAuthorButton" type="button">联系作者</button>
        </div>
      </div>
    </div>

    <div class="app-shell hidden" id="appShell">
      <section class="hero">
        <div class="hero-topbar">
          <div class="hero-copy">
            <button class="ghost-icon hero-back" id="backToLanding" title="返回背景">←</button>
            <h1 id="heroTitle"></h1>
          </div>
          <div class="hero-copy-text">
            <p class="hero-text" id="heroText"></p>
          </div>
        </div>
        <div class="status-chip" id="statusChip"></div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2 id="imagesTitle"></h2>
          <button class="text-button" id="clearImagesButton"></button>
        </div>
        <div class="image-grid">
          <div class="image-card">
            <div class="image-head" id="designTitle"></div>
            <div class="image-body" id="designBody">
              <img id="designImage" alt="" />
              <div class="image-empty"></div>
              <div class="image-card-action">
                <button class="ghost" id="captureDesignButton"></button>
              </div>
            </div>
          </div>
          <div class="image-card">
            <div class="image-head" id="devTitle"></div>
            <div class="image-body" id="devBody">
              <img id="devImage" alt="" />
              <div class="image-empty"></div>
              <div class="image-card-action">
                <button class="ghost" id="captureDevButton"></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2 id="aiTitle"></h2>
        </div>
        <div class="field-grid">
          <label class="field">
            <span id="providerLabel"></span>
            <select id="providerSelect"></select>
          </label>
          <label class="field">
            <span id="modelLabel"></span>
            <select id="modelSelect"></select>
          </label>
          <label class="field">
            <span id="apiKeyLabel"></span>
            <input id="apiKeyInput" type="password" />
          </label>
        </div>
        <label class="field">
          <span id="extraInstructionLabel"></span>
          <textarea id="extraInstructionInput" rows="4"></textarea>
        </label>
        <div class="action-row">
          <button class="primary" id="analyzeButton"></button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2 id="reportTitle"></h2>
          <div class="report-head-actions">
            <button class="ghost" id="clearHighlightsButton"></button>
            <button class="accent" id="highlightAllButton"></button>
          </div>
        </div>
        <div id="reportContainer"></div>
      </section>
    </div>

    <script>
      (function () {
      let didRenderFatalError = false;

      function getFatalErrorMessage(error) {
        if (!error) return "Unknown UI startup error";
        if (typeof error === "string") return error;
        if (error && typeof error.message === "string") return error.message;
        try {
          return String(error);
        } catch (stringifyError) {
          return "Unknown UI startup error";
        }
      }

      function escapeFatalHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function renderFatalStartupError(error) {
        if (didRenderFatalError) return;
        didRenderFatalError = true;
        const message = getFatalErrorMessage(error);

        try {
          console.error("[UI Review Plugin] UI startup/runtime error:", error);
        } catch (consoleError) {}

        if (!document || !document.body) return;

        document.body.innerHTML = [
          '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;padding:24px;font-family:Inter, PingFang SC, Microsoft YaHei, sans-serif;">',
          '  <div style="width:100%;max-width:320px;border:1px solid #ffd5d5;border-radius:18px;background:#fff6f6;padding:18px 16px;box-shadow:0 14px 36px rgba(214,67,67,0.08);">',
          '    <div style="font-size:16px;font-weight:700;line-height:24px;color:#d64343;">插件运行出错</div>',
          '    <div style="margin-top:8px;font-size:13px;line-height:20px;color:#c23d3d;">UI 启动时捕获到异常，已阻止插件直接崩溃。请重新打开插件；如果问题仍然存在，请把下面这段错误信息发给作者。</div>',
          '    <div style="margin-top:12px;border-radius:12px;background:#ffffff;padding:10px 12px;font-size:12px;line-height:18px;color:#8f2f2f;word-break:break-word;">' + escapeFatalHtml(message) + '</div>',
          '  </div>',
          '</div>'
        ].join("");
      }

      try {
      window.addEventListener("error", function (event) {
        renderFatalStartupError(event && (event.error || event.message));
      });

      window.addEventListener("unhandledrejection", function (event) {
        renderFatalStartupError(event && event.reason);
      });

      const LANGUAGE_OPTIONS = [
        { value: "zh", label: "中文" },
        { value: "en", label: "English" },
        { value: "ko", label: "한국어" }
      ];

      const PROVIDER_OPTIONS = [
        { label: "OpenAI", value: "openai" },
        { label: "Google Gemini", value: "gemini" },
        { label: "Anthropic", value: "anthropic" },
        { label: "xAI", value: "xai" },
        { label: "DeepSeek", value: "deepseek" },
        { label: "Meta", value: "meta" },
        { label: "Qwen", value: "qwen" },
        { label: "Moonshot", value: "moonshot" },
        { label: "Mistral", value: "mistral" },
        { label: "Cohere", value: "cohere" }
      ];

      const MODEL_OPTIONS = {
        openai: [
          { label: "GPT-4.1", value: "gpt-4.1" },
          { label: "GPT-4.1 Mini", value: "gpt-4.1-mini" },
          { label: "GPT-4o", value: "gpt-4o" },
          { label: "GPT-4o Mini", value: "gpt-4o-mini" },
          { label: "o4-mini", value: "o4-mini" },
          { label: "o3", value: "o3" }
        ],
        gemini: [
          { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
          { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
          { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
          { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" }
        ],
        anthropic: [
          { label: "Claude Sonnet 4", value: "anthropic/claude-sonnet-4" },
          { label: "Claude Opus 4", value: "anthropic/claude-opus-4" }
        ],
        xai: [
          { label: "Grok 3 Mini", value: "x-ai/grok-3-mini" },
          { label: "Grok 3", value: "x-ai/grok-3" }
        ],
        deepseek: [
          { label: "DeepSeek Chat V3", value: "deepseek/deepseek-chat-v3-0324" },
          { label: "DeepSeek R1", value: "deepseek/deepseek-r1" }
        ],
        meta: [
          { label: "Llama 4 Maverick", value: "meta-llama/llama-4-maverick" },
          { label: "Llama 3.3 70B", value: "meta-llama/llama-3.3-70b-instruct" }
        ],
        qwen: [
          { label: "Qwen3-VL-Plus", value: "qwen3-vl-plus" },
          { label: "Qwen 3 235B", value: "qwen/qwen3-235b-a22b" },
          { label: "Qwen 2.5 72B", value: "qwen/qwen-2.5-72b-instruct" }
        ],
        moonshot: [
          { label: "Kimi K2", value: "moonshotai/kimi-k2" },
          { label: "Kimi Dev 72B", value: "moonshotai/kimi-dev-72b" }
        ],
        mistral: [
          { label: "Mistral Large", value: "mistralai/mistral-large" },
          { label: "Pixtral Large", value: "mistralai/pixtral-large" }
        ],
        cohere: [
          { label: "Command R+", value: "cohere/command-r-plus" },
          { label: "Command R7B", value: "cohere/command-r7b" }
        ]
      };

      const OPENROUTER_PROVIDERS = ["anthropic", "xai", "deepseek", "meta", "moonshot", "mistral", "cohere"];

      const DEFAULT_EXTRA = {
        zh: "重点检查布局、字号、颜色、间距、对齐、缺失元素和交互态差异。",
        en: "Focus on layout, typography, color, spacing, alignment, missing elements, and interaction-state differences.",
        ko: "레이아웃, 글자 크기, 색상, 간격, 정렬, 누락된 요소, 인터랙션 상태 차이를 중점적으로 확인해 주세요."
      };

      const COPY = {
        zh: {
          title: "UI 差异走查助手",
          heroText: "对比设计稿和手机截图，自动输出结构化 UI 差异报告，并直接在 Figma 里高亮问题区域。",
          enterWorkspace: "进入功能区",
          contactAuthor: "联系作者",
          ready: "准备开始",
          sectionImages: "准备图片",
          clearImages: "清空图片",
          designImage: "设计稿",
          devImage: "手机截图",
          useCurrentFrame: "使用当前 Frame",
          sectionAi: "AI 设置",
          provider: "服务商",
          providerPlaceholder: "请选择服务商",
          model: "模型",
          modelPlaceholder: "请选择模型",
          modelPlaceholderBeforeProvider: "请先选择服务商",
          apiKey: "API Key",
          apiKeyPlaceholder: "请输入 API Key",
          apiKeyPlaceholderOpenRouter: "请输入 OpenRouter API Key",
          apiKeyPlaceholderQwen: "请输入 DashScope API Key",
          apiKeyPlaceholderBeforeModel: "请先选择模型",
          extraInstruction: "补充要求",
          analyze: "开始 AI 走查",
          analyzing: "AI 走查中…",
          report: "差异报告",
          clearHighlights: "清除高亮",
          highlightAll: "全高亮",
          highlightSingle: "高亮",
          overallRisk: "整体风险",
          analyzeReturned: function (count) { return "AI 已返回 " + count + " 条差异结果，请逐条确认。"; },
          regeneratingReport: "正在按中文重新生成报告…",
          emptyReport: "还没有差异报告。准备好图片后，点“开始 AI 走查”。",
          needInputs: "请先选择服务商、模型，填写 API Key，并准备好设计稿和手机截图",
          captureDesign: "正在获取当前 Frame 作为设计稿…",
          captureDev: "正在获取当前 Frame 作为手机截图…",
          capturedDesign: function (name) { return "已使用当前 Frame 作为设计稿：" + name; },
          capturedDev: function (name) { return "已使用当前 Frame 作为手机截图：" + name; },
          clearedImages: "已清空设计稿和手机截图",
          noIssues: "当前没有可高亮的问题",
          highlighted: function (count) { return "已在 Figma 中高亮 " + count + " 个问题"; },
          clearedHighlights: "已清除 Figma 中的高亮",
          back: "返回背景"
        },
        en: {
          title: "UI Review Assistant",
          heroText: "Compare the design frame with the implementation screenshot, generate a structured UI review, and highlight issues directly in Figma.",
          enterWorkspace: "Enter Workspace",
          contactAuthor: "Contact Author",
          ready: "Ready to start",
          sectionImages: "Prepare Images",
          clearImages: "Clear Images",
          designImage: "Design",
          devImage: "Implementation",
          useCurrentFrame: "Use Current Frame",
          sectionAi: "AI Settings",
          provider: "Provider",
          providerPlaceholder: "Select a provider",
          model: "Model",
          modelPlaceholder: "Select a model",
          modelPlaceholderBeforeProvider: "Select a provider first",
          apiKey: "API Key",
          apiKeyPlaceholder: "Enter your API key",
          apiKeyPlaceholderOpenRouter: "Enter your OpenRouter API key",
          apiKeyPlaceholderQwen: "Enter your DashScope API key",
          apiKeyPlaceholderBeforeModel: "Select a model first",
          extraInstruction: "Extra Instructions",
          analyze: "Start AI Review",
          analyzing: "Reviewing…",
          report: "Review Report",
          clearHighlights: "Clear",
          highlightAll: "Show All",
          highlightSingle: "Highlight",
          overallRisk: "Overall Risk",
          analyzeReturned: function (count) { return "AI returned " + count + " issues. Please review them one by one."; },
          regeneratingReport: "Regenerating the report in English…",
          emptyReport: "No review report yet. Prepare both images, then click “Start AI Review”.",
          needInputs: "Select a provider and model, enter an API key, and prepare both the design and implementation images first.",
          captureDesign: "Capturing the current Frame as the design image…",
          captureDev: "Capturing the current Frame as the implementation image…",
          capturedDesign: function (name) { return "Using the current Frame as the design image: " + name; },
          capturedDev: function (name) { return "Using the current Frame as the implementation image: " + name; },
          clearedImages: "Cleared the design and implementation images",
          noIssues: "There are no issues to highlight right now",
          highlighted: function (count) { return "Highlighted " + count + " issues in Figma"; },
          clearedHighlights: "Cleared the highlights in Figma",
          back: "Back"
        },
        ko: {
          title: "UI 리뷰 도우미",
          heroText: "디자인 프레임과 구현 스크린샷을 비교해 구조화된 UI 리뷰를 만들고, 문제 영역을 Figma에서 바로 강조 표시합니다.",
          enterWorkspace: "기능 화면으로",
          contactAuthor: "작성자 문의",
          ready: "시작할 준비 완료",
          sectionImages: "이미지 준비",
          clearImages: "이미지 비우기",
          designImage: "디자인",
          devImage: "구현 화면",
          useCurrentFrame: "현재 Frame 사용",
          sectionAi: "AI 설정",
          provider: "서비스 제공자",
          providerPlaceholder: "서비스 제공자를 선택하세요",
          model: "모델",
          modelPlaceholder: "모델을 선택하세요",
          modelPlaceholderBeforeProvider: "먼저 서비스 제공자를 선택하세요",
          apiKey: "API Key",
          apiKeyPlaceholder: "API Key를 입력하세요",
          apiKeyPlaceholderOpenRouter: "OpenRouter API Key를 입력하세요",
          apiKeyPlaceholderQwen: "DashScope API Key를 입력하세요",
          apiKeyPlaceholderBeforeModel: "먼저 모델을 선택하세요",
          extraInstruction: "추가 요청",
          analyze: "AI 리뷰 시작",
          analyzing: "리뷰 진행 중…",
          report: "리뷰 보고서",
          clearHighlights: "강조 해제",
          highlightAll: "모두 강조",
          highlightSingle: "강조",
          overallRisk: "전체 위험도",
          analyzeReturned: function (count) { return "AI가 " + count + "개 문제를 반환했습니다. 하나씩 확인해 주세요."; },
          regeneratingReport: "한국어로 보고서를 다시 생성하는 중…",
          emptyReport: "아직 리뷰 보고서가 없습니다. 이미지를 준비한 뒤 “AI 리뷰 시작”을 눌러 주세요.",
          needInputs: "서비스 제공자와 모델을 선택하고 API Key를 입력한 뒤 디자인 이미지와 구현 이미지를 모두 준비해 주세요.",
          captureDesign: "현재 Frame을 디자인 이미지로 가져오는 중…",
          captureDev: "현재 Frame을 구현 이미지로 가져오는 중…",
          capturedDesign: function (name) { return "현재 Frame을 디자인 이미지로 사용 중: " + name; },
          capturedDev: function (name) { return "현재 Frame을 구현 이미지로 사용 중: " + name; },
          clearedImages: "디자인 이미지와 구현 이미지를 비웠습니다",
          noIssues: "강조할 문제가 없습니다",
          highlighted: function (count) { return "Figma에서 " + count + "개 문제를 강조 표시했습니다"; },
          clearedHighlights: "Figma 강조 표시를 해제했습니다",
          back: "배경으로"
        }
      };

      const storage = {
        get: function (key) {
          try {
            return window.localStorage ? window.localStorage.getItem(key) : null;
          } catch (error) {
            return null;
          }
        },
        set: function (key, value) {
          try {
            if (window.localStorage) {
              window.localStorage.setItem(key, value);
            }
          } catch (error) {}
        },
        remove: function (key) {
          try {
            if (window.localStorage) {
              window.localStorage.removeItem(key);
            }
          } catch (error) {}
        }
      };

      const state = {
        view: "landing",
        language: storage.get("ui-review-language") || "en",
        provider: storage.get("ui-review-provider") || "",
        model: storage.get("ui-review-model") || "",
        apiKey: "",
        extraInstruction: "",
        designImage: "",
        devImage: "",
        designName: "",
        devName: "",
        loading: false,
        status: "",
        statusTone: "info",
        report: null
      };

      const elements = {
        landingScreen: document.getElementById("landingScreen"),
        appShell: document.getElementById("appShell"),
        enterAppButton: document.getElementById("enterAppButton"),
        contactAuthorButton: document.getElementById("contactAuthorButton"),
        landingLanguageSelect: document.getElementById("landingLanguageSelect"),
        landingLanguageLabel: document.getElementById("landingLanguageLabel"),
        landingTitle: document.getElementById("landingTitle"),
        landingText: document.getElementById("landingText"),
        backToLanding: document.getElementById("backToLanding"),
        heroTitle: document.getElementById("heroTitle"),
        heroText: document.getElementById("heroText"),
        statusChip: document.getElementById("statusChip"),
        imagesTitle: document.getElementById("imagesTitle"),
        clearImagesButton: document.getElementById("clearImagesButton"),
        designTitle: document.getElementById("designTitle"),
        devTitle: document.getElementById("devTitle"),
        captureDesignButton: document.getElementById("captureDesignButton"),
        captureDevButton: document.getElementById("captureDevButton"),
        designBody: document.getElementById("designBody"),
        devBody: document.getElementById("devBody"),
        designImage: document.getElementById("designImage"),
        devImage: document.getElementById("devImage"),
        aiTitle: document.getElementById("aiTitle"),
        providerLabel: document.getElementById("providerLabel"),
        modelLabel: document.getElementById("modelLabel"),
        apiKeyLabel: document.getElementById("apiKeyLabel"),
        extraInstructionLabel: document.getElementById("extraInstructionLabel"),
        providerSelect: document.getElementById("providerSelect"),
        modelSelect: document.getElementById("modelSelect"),
        apiKeyInput: document.getElementById("apiKeyInput"),
        extraInstructionInput: document.getElementById("extraInstructionInput"),
        analyzeButton: document.getElementById("analyzeButton"),
        reportTitle: document.getElementById("reportTitle"),
        clearHighlightsButton: document.getElementById("clearHighlightsButton"),
        highlightAllButton: document.getElementById("highlightAllButton"),
        reportContainer: document.getElementById("reportContainer"),
        flowHorizontal: document.querySelector(".flow-track-horizontal"),
        flowHorizontalDot: document.querySelector(".flow-track-horizontal span"),
        flowVertical: document.querySelector(".flow-track-vertical"),
        flowVerticalDot: document.querySelector(".flow-track-vertical span")
      };

      const FLOW_GRID_COLUMNS = 5;
      let lastFlowRow = -1;
      let lastFlowColumn = -1;
      let lastRequestedPluginHeight = 0;
      let resizeUiTimer = null;

      function getText() {
        return COPY[state.language] || COPY.zh;
      }

      function severityLabel(level) {
        if (state.language === "zh") {
          return level === "high" ? "高" : level === "medium" ? "中" : "低";
        }
        if (state.language === "ko") {
          return level === "high" ? "높음" : level === "medium" ? "보통" : "낮음";
        }
        return level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
      }

      function highlightButtonLabel(level) {
        const base = getText().highlightSingle;
        return severityLabel(level) + "/" + base;
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function localizeReportText(value) {
        const source = String(value || "");
        if (!source) return "";

        const replacements = state.language === "en"
          ? [
              [/类型[:：]/g, "Type: "],
              [/位置[:：]/g, "Location: "],
              [/问题[:：]/g, "Issue: "],
              [/原因[:：]/g, "Cause: "],
              [/风险[:：]/g, "Risk: "],
              [/修改建议[:：]/g, "Recommendation: "],
              [/整体风险[:：]/g, "Overall Risk: "],
              [/文案差异/g, "Copy Difference"],
              [/布局差异/g, "Layout Difference"],
              [/颜色差异/g, "Color Difference"],
              [/字号差异/g, "Typography Difference"],
              [/交互态差异/g, "Interaction Difference"],
              [/组件差异/g, "Component Difference"],
              [/缺失元素/g, "Missing Element"],
              [/对齐\+间距差异/g, "Alignment + Spacing Difference"],
              [/对齐差异/g, "Alignment Difference"],
              [/间距差异/g, "Spacing Difference"]
            ]
          : state.language === "ko"
            ? [
                [/类型[:：]/g, "유형: "],
                [/位置[:：]/g, "위치: "],
                [/问题[:：]/g, "문제: "],
                [/原因[:：]/g, "원인: "],
                [/风险[:：]/g, "위험: "],
                [/修改建议[:：]/g, "수정 제안: "],
                [/整体风险[:：]/g, "전체 위험도: "],
                [/文案差异/g, "문구 차이"],
                [/布局差异/g, "레이아웃 차이"],
                [/颜色差异/g, "색상 차이"],
                [/字号差异/g, "타이포 차이"],
                [/交互态差异/g, "인터랙션 차이"],
                [/组件差异/g, "컴포넌트 차이"],
                [/缺失元素/g, "누락 요소"],
                [/对齐\+间距差异/g, "정렬 + 간격 차이"],
                [/对齐差异/g, "정렬 차이"],
                [/间距差异/g, "간격 차이"]
              ]
            : [
                [/Type:\s*/g, "类型："],
                [/Location:\s*/g, "位置："],
                [/Issue:\s*/g, "问题："],
                [/Cause:\s*/g, "原因："],
                [/Risk:\s*/g, "风险："],
                [/Recommendation:\s*/g, "修改建议："],
                [/Overall Risk:\s*/g, "整体风险："],
                [/유형:\s*/g, "类型："],
                [/위치:\s*/g, "位置："],
                [/문제:\s*/g, "问题："],
                [/원인:\s*/g, "原因："],
                [/위험:\s*/g, "风险："],
                [/수정 제안:\s*/g, "修改建议："],
                [/전체 위험도:\s*/g, "整体风险："]
              ];

        return replacements.reduce(function (result, entry) {
          return result.replace(entry[0], entry[1]);
        }, source);
      }

      function cleanReportChunk(value) {
        return String(value || "")
          .replace(/^[\\s\\-–—:：;；。,.，]+/, "")
          .replace(/[\\s\\-–—:：;；。,.，]+$/, "")
          .trim();
      }

      function formatReportText(value) {
        const source = localizeReportText(value).replace(/\\s+/g, " ").trim();
        if (!source) return "";

        const labelPattern = /(P[0-3][^:：]{0,36}|整体风险总结|最优先修复项|问题主线|修改建议|类型|位置|问题|原因|风险|Overall Risk|Recommendation|Location|Issue|Cause|Risk|Type|전체 위험도|수정 제안|유형|위치|문제|원인|위험)\\s*[:：]/g;
        const parts = [];
        let match;
        let lastLabel = "";
        let lastIndex = 0;

        while ((match = labelPattern.exec(source)) !== null) {
          if (lastLabel) {
            const body = cleanReportChunk(source.slice(lastIndex, match.index));
            if (body) {
              parts.push({ label: cleanReportChunk(lastLabel), body: body });
            }
          }
          lastLabel = match[1];
          lastIndex = labelPattern.lastIndex;
        }

        if (lastLabel) {
          const body = cleanReportChunk(source.slice(lastIndex));
          if (body) {
            parts.push({ label: cleanReportChunk(lastLabel), body: body });
          }
        }

        if (parts.length) {
          return '<div class="issue-field-list">' + parts.map(function (part) {
            return [
              '<div class="issue-field">',
              '  <div class="issue-field-label">' + escapeHtml(part.label) + "</div>",
              '  <div class="issue-field-body">' + escapeHtml(part.body) + "</div>",
              "</div>"
            ].join("");
          }).join("") + "</div>";
        }

        const sentences = source
          .replace(/([。.!?！？])\\s+/g, "$1|")
          .split("|")
          .map(cleanReportChunk)
          .filter(Boolean);

        if (sentences.length > 1) {
          return '<div class="issue-paragraphs">' + sentences.map(function (sentence) {
            return "<p>" + escapeHtml(sentence) + "</p>";
          }).join("") + "</div>";
        }

        return escapeHtml(source);
      }

      function formatRecommendationText(value) {
        const source = localizeReportText(value).replace(/\\s+/g, " ").trim();
        if (!source) return "";
        const items = source
          .split(/(?:^|\\s)(?:\\d+[.、]|[①②③④⑤]|[-•])\\s+/)
          .map(cleanReportChunk)
          .filter(Boolean);

        if (items.length > 1) {
          return '<div class="issue-field-list">' + items.map(function (item, index) {
            return [
              '<div class="issue-field">',
              '  <div class="issue-field-label">' + (index + 1) + "</div>",
              '  <div class="issue-field-body">' + escapeHtml(item) + "</div>",
              "</div>"
            ].join("");
          }).join("") + "</div>";
        }

        return formatReportText(source);
      }

      function setStatus(value, tone) {
        state.status = value;
        state.statusTone = tone || "info";
        render();
      }

      function isOpenRouterProvider(provider) {
        return OPENROUTER_PROVIDERS.indexOf(provider) >= 0;
      }

      function getApiKeyPlaceholder() {
        const text = getText();
        if (!state.model) return text.apiKeyPlaceholderBeforeModel;
        if (state.provider === "qwen") return text.apiKeyPlaceholderQwen;
        if (isOpenRouterProvider(state.provider)) return text.apiKeyPlaceholderOpenRouter;
        return text.apiKeyPlaceholder;
      }

      function getApiKeyStorageKey(provider, model) {
        return provider && model ? "ui-review-api-key-" + provider + "-" + model : "";
      }

      function loadRememberedApiKey(provider, model) {
        const key = getApiKeyStorageKey(provider, model);
        return key ? storage.get(key) || "" : "";
      }

      function rememberApiKey(provider, model, value) {
        const key = getApiKeyStorageKey(provider, model);
        if (!key) return;
        storage.set(key, value);
        parent.postMessage({ pluginMessage: { type: "save-api-key", provider: provider || "", model: model || "", apiKey: value || "" } }, "*");
      }

      function rememberSelection(provider, model) {
        if (!provider || !model) return;
        parent.postMessage({ pluginMessage: { type: "save-settings", provider: provider, model: model } }, "*");
      }

      function requestRememberedApiKey(provider, model) {
        if (!provider || !model) return;
        parent.postMessage({ pluginMessage: { type: "load-api-key", provider: provider || "", model: model || "" } }, "*");
      }

      function requestRememberedSettings() {
        parent.postMessage({ pluginMessage: { type: "load-settings" } }, "*");
      }

      function getAdaptivePluginHeight() {
        let screenHeight = 0;
        if (window.screen && typeof window.screen.availHeight === "number" && window.screen.availHeight > 0) {
          screenHeight = window.screen.availHeight;
        }
        if (!screenHeight && window.screen && typeof window.screen.height === "number" && window.screen.height > 0) {
          screenHeight = window.screen.height;
        }
        if (!screenHeight && typeof window.innerHeight === "number" && window.innerHeight > 0) {
          screenHeight = window.innerHeight + 96;
        }

        let targetHeight = screenHeight ? (screenHeight - 72) * 0.75 : 640;
        if (targetHeight < 520) targetHeight = 520;
        if (targetHeight > 1200) targetHeight = 1200;
        return Math.round(targetHeight);
      }

      function requestAdaptivePluginHeight(force) {
        const nextHeight = getAdaptivePluginHeight();
        if (!force && Math.abs(nextHeight - lastRequestedPluginHeight) < 4) {
          return;
        }
        lastRequestedPluginHeight = nextHeight;
        parent.postMessage({ pluginMessage: { type: "resize-ui", height: nextHeight } }, "*");
      }

      function scheduleAdaptivePluginHeight(force) {
        if (resizeUiTimer) {
          clearTimeout(resizeUiTimer);
        }
        resizeUiTimer = setTimeout(function () {
          requestAdaptivePluginHeight(force);
        }, force ? 0 : 120);
      }

      function canAnalyze() {
        return Boolean(state.provider && state.model && state.apiKey && state.designImage && state.devImage);
      }

      function canClearImages() {
        return Boolean(state.designImage || state.devImage);
      }

      function renderProviderOptions() {
        const text = getText();
        const current = state.provider;
        elements.providerSelect.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = text.providerPlaceholder;
        elements.providerSelect.appendChild(placeholder);
        PROVIDER_OPTIONS.forEach(function (option) {
          const node = document.createElement("option");
          node.value = option.value;
          node.textContent = option.label;
          elements.providerSelect.appendChild(node);
        });
        elements.providerSelect.value = current;
      }

      function renderModelOptions() {
        const text = getText();
        const models = state.provider ? (MODEL_OPTIONS[state.provider] || []) : [];
        const current = state.model;
        elements.modelSelect.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = state.provider ? text.modelPlaceholder : text.modelPlaceholderBeforeProvider;
        elements.modelSelect.appendChild(placeholder);
        models.forEach(function (option) {
          const node = document.createElement("option");
          node.value = option.value;
          node.textContent = option.label;
          elements.modelSelect.appendChild(node);
        });
        elements.modelSelect.disabled = !state.provider;
        elements.modelSelect.value = current;
        if (models.every(function (item) { return item.value !== current; })) {
          elements.modelSelect.value = "";
          state.model = "";
        }
      }

      function renderLanguageOptions() {
        const current = state.language;
        elements.landingLanguageSelect.innerHTML = "";
        LANGUAGE_OPTIONS.forEach(function (option) {
          const landingNode = document.createElement("option");
          landingNode.value = option.value;
          landingNode.textContent = option.label;
          elements.landingLanguageSelect.appendChild(landingNode);
        });
        elements.landingLanguageSelect.value = current;
      }

      function renderReport() {
        const text = getText();
        const report = state.report;
        if (!report) {
          elements.reportContainer.innerHTML = '<div class="empty-block">' + escapeHtml(text.emptyReport) + "</div>";
          return;
        }

        const issuesHtml = (report.issues || []).map(function (issue) {
          return [
            '<article class="issue-card">',
            '  <div class="issue-card-head">',
            '    <div class="issue-title-row">',
            "        <h3>" + escapeHtml(localizeReportText(issue.title)) + "</h3>",
            "    </div>",
            '    <button class="issue-action ' + escapeHtml(issue.severity) + '" data-highlight-id="' + escapeHtml(issue.id) + '">' + escapeHtml(highlightButtonLabel(issue.severity)) + "</button>",
            "  </div>",
            '  <div class="issue-description">' + formatReportText(issue.summary) + "</div>",
            '  <div class="issue-recommendation">' + formatRecommendationText(issue.recommendation) + "</div>",
            "</article>"
          ].join("");
        }).join("");

        elements.reportContainer.innerHTML = [
          '<div class="report-summary">',
          '  <div class="risk-pill ' + escapeHtml(report.overallRisk) + '">' + escapeHtml(text.overallRisk) + ": " + escapeHtml(severityLabel(report.overallRisk)) + "</div>",
          "  <p>" + escapeHtml(localizeReportText(report.summary)) + "</p>",
          "</div>",
          '<div class="issue-list">' + issuesHtml + "</div>"
        ].join("");

        elements.reportContainer.querySelectorAll("[data-highlight-id]").forEach(function (button) {
          button.addEventListener("click", function () {
            const issueId = button.getAttribute("data-highlight-id");
            const target = (state.report.issues || []).find(function (item) { return item.id === issueId; });
            if (!target) return;
            parent.postMessage({ pluginMessage: { type: "highlight-issues", issues: [target], language: state.language } }, "*");
          });
        });
      }

      function renderImages() {
        if (state.designImage) {
          elements.designBody.classList.add("has-image");
          elements.designImage.src = state.designImage;
        } else {
          elements.designBody.classList.remove("has-image");
          elements.designImage.removeAttribute("src");
        }

        if (state.devImage) {
          elements.devBody.classList.add("has-image");
          elements.devImage.src = state.devImage;
        } else {
          elements.devBody.classList.remove("has-image");
          elements.devImage.removeAttribute("src");
        }
      }

      function render() {
        const text = getText();

        elements.landingScreen.classList.toggle("hidden", state.view !== "landing");
        elements.appShell.classList.toggle("hidden", state.view !== "app");

        const landingLanguage = LANGUAGE_OPTIONS.find(function (item) { return item.value === state.language; });
        elements.landingTitle.textContent = text.title;
        elements.landingText.textContent = text.heroText;
        elements.landingLanguageLabel.textContent = landingLanguage ? landingLanguage.label : "English";
        elements.enterAppButton.textContent = text.enterWorkspace;
        elements.contactAuthorButton.textContent = text.contactAuthor;
        elements.heroTitle.textContent = text.title;
        elements.heroText.textContent = text.heroText;
        elements.statusChip.textContent = state.status || text.ready;
        elements.statusChip.classList.toggle("error", state.statusTone === "error");
        elements.imagesTitle.textContent = text.sectionImages;
        elements.clearImagesButton.textContent = text.clearImages;
        elements.designTitle.textContent = text.designImage;
        elements.devTitle.textContent = text.devImage;
        elements.captureDesignButton.textContent = text.useCurrentFrame;
        elements.captureDevButton.textContent = text.useCurrentFrame;
        elements.aiTitle.textContent = text.sectionAi;
        elements.providerLabel.textContent = text.provider;
        elements.modelLabel.textContent = text.model;
        elements.apiKeyLabel.textContent = text.apiKey;
        elements.extraInstructionLabel.textContent = text.extraInstruction;
        elements.analyzeButton.textContent = state.loading ? text.analyzing : text.analyze;
        elements.reportTitle.textContent = text.report;
        elements.clearHighlightsButton.textContent = text.clearHighlights;
        elements.highlightAllButton.textContent = text.highlightAll;
        elements.backToLanding.title = text.back;

        renderLanguageOptions();
        renderProviderOptions();
        renderModelOptions();
        renderImages();
        renderReport();

        elements.clearImagesButton.disabled = !canClearImages();
        elements.highlightAllButton.disabled = !(state.report && state.report.issues && state.report.issues.length);
        elements.clearHighlightsButton.disabled = !(state.report && state.report.issues && state.report.issues.length);
        elements.analyzeButton.disabled = state.loading || !canAnalyze();
        elements.apiKeyInput.disabled = !state.model;
        elements.apiKeyInput.placeholder = getApiKeyPlaceholder();
        elements.apiKeyInput.value = state.apiKey;
        elements.extraInstructionInput.value = state.extraInstruction || DEFAULT_EXTRA[state.language];
      }

      function clearImagesOnly() {
        const text = getText();
        state.designImage = "";
        state.devImage = "";
        state.designName = "";
        state.devName = "";
        state.report = null;
        setStatus(text.clearedImages);
      }

      function analyze() {
        const text = getText();
        if (!canAnalyze()) {
          setStatus(text.needInputs, "error");
          return;
        }
        state.loading = true;
        setStatus(text.analyzing);
        parent.postMessage({
          pluginMessage: {
            type: "analyze-ui",
            provider: state.provider,
            apiKey: state.apiKey,
            model: state.model,
            designImage: state.designImage,
            implementedImage: state.devImage,
            extraInstruction: state.extraInstruction,
            language: state.language
          }
        }, "*");
      }

      function updateLandingPointer(event) {
        const rect = elements.landingScreen.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        elements.landingScreen.style.setProperty("--pointer-x", x + "px");
        elements.landingScreen.style.setProperty("--pointer-y", y + "px");
        elements.landingScreen.classList.add("is-pointer-active");
      }

      function pickDifferentIndex(max, previous) {
        if (max <= 1) return 1;
        let next = 1 + Math.floor(Math.random() * max);
        if (next === previous) {
          next = next >= max ? 1 : next + 1;
        }
        return next;
      }

      function getFlowGridSize() {
        const rect = elements.landingScreen.getBoundingClientRect();
        return (rect.width || 400) / FLOW_GRID_COLUMNS;
      }

      function syncFlowGridSize() {
        const gridSize = getFlowGridSize();
        elements.landingScreen.style.setProperty("--flow-grid-size", gridSize + "px");
        return gridSize;
      }

      function randomizeHorizontalFlowLine() {
        if (!elements.flowHorizontal) return;
        const rect = elements.landingScreen.getBoundingClientRect();
        const gridSize = syncFlowGridSize();
        const maxRow = Math.max(1, Math.floor((rect.height || 900) / gridSize) - 1);
        lastFlowRow = pickDifferentIndex(maxRow, lastFlowRow);
        elements.flowHorizontal.style.setProperty("--flow-horizontal-y", (lastFlowRow * gridSize - 8) + "px");
      }

      function randomizeVerticalFlowLine() {
        if (!elements.flowVertical) return;
        const rect = elements.landingScreen.getBoundingClientRect();
        const gridX = syncFlowGridSize();
        const maxColumn = FLOW_GRID_COLUMNS - 1;
        lastFlowColumn = pickDifferentIndex(maxColumn, lastFlowColumn);
        elements.flowVertical.style.setProperty("--flow-vertical-x", (lastFlowColumn * gridX - 8) + "px");
      }

      function randomizeFlowLines() {
        randomizeHorizontalFlowLine();
        randomizeVerticalFlowLine();
      }

      elements.landingScreen.addEventListener("pointermove", updateLandingPointer);
      elements.landingScreen.addEventListener("pointerleave", function () {
        elements.landingScreen.classList.remove("is-pointer-active");
      });

      if (elements.flowHorizontalDot) {
        elements.flowHorizontalDot.addEventListener("animationiteration", randomizeFlowLines);
      }

      window.addEventListener("resize", function () {
        randomizeFlowLines();
        scheduleAdaptivePluginHeight(false);
      });

      elements.enterAppButton.addEventListener("click", function () {
        state.view = "app";
        render();
      });

      elements.contactAuthorButton.addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "open-contact", language: state.language } }, "*");
      });

      elements.backToLanding.addEventListener("click", function () {
        state.view = "landing";
        render();
      });

      elements.landingLanguageSelect.addEventListener("change", function (event) {
        const shouldRegenerateReport = Boolean(state.report && !state.loading && canAnalyze());
        state.language = event.target.value;
        if (!state.extraInstruction || state.extraInstruction === DEFAULT_EXTRA.zh || state.extraInstruction === DEFAULT_EXTRA.en || state.extraInstruction === DEFAULT_EXTRA.ko) {
          state.extraInstruction = DEFAULT_EXTRA[state.language];
        }
        storage.set("ui-review-language", state.language);
        if (shouldRegenerateReport) {
          state.loading = true;
          state.status = getText().regeneratingReport;
          state.statusTone = "info";
          render();
          parent.postMessage({
            pluginMessage: {
              type: "analyze-ui",
              provider: state.provider,
              apiKey: state.apiKey,
              model: state.model,
              designImage: state.designImage,
              implementedImage: state.devImage,
              extraInstruction: state.extraInstruction,
              language: state.language
            }
          }, "*");
          return;
        }
        render();
      });

      elements.providerSelect.addEventListener("change", function (event) {
        state.provider = event.target.value;
        state.model = "";
        state.apiKey = "";
        storage.set("ui-review-provider", state.provider);
        storage.remove("ui-review-model");
        render();
      });

      elements.modelSelect.addEventListener("change", function (event) {
        state.model = event.target.value;
        state.apiKey = loadRememberedApiKey(state.provider, state.model);
        storage.set("ui-review-model", state.model);
        rememberSelection(state.provider, state.model);
        requestRememberedApiKey(state.provider, state.model);
        render();
      });

      elements.apiKeyInput.addEventListener("input", function (event) {
        state.apiKey = event.target.value;
        rememberApiKey(state.provider, state.model, state.apiKey);
        render();
      });

      elements.extraInstructionInput.addEventListener("input", function (event) {
        state.extraInstruction = event.target.value;
      });

      elements.captureDesignButton.addEventListener("click", function () {
        const text = getText();
        setStatus(text.captureDesign);
        parent.postMessage({ pluginMessage: { type: "capture-current-frame", target: "design", language: state.language } }, "*");
      });

      elements.captureDevButton.addEventListener("click", function () {
        const text = getText();
        setStatus(text.captureDev);
        parent.postMessage({ pluginMessage: { type: "capture-current-frame", target: "dev", language: state.language } }, "*");
      });

      elements.clearImagesButton.addEventListener("click", clearImagesOnly);

      elements.analyzeButton.addEventListener("click", analyze);

      elements.highlightAllButton.addEventListener("click", function () {
        const text = getText();
        if (!(state.report && state.report.issues && state.report.issues.length)) {
          setStatus(text.noIssues);
          return;
        }
        parent.postMessage({ pluginMessage: { type: "highlight-issues", issues: state.report.issues, language: state.language } }, "*");
      });

      elements.clearHighlightsButton.addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "clear-highlights", language: state.language } }, "*");
      });

      window.onmessage = function (event) {
        const data = event && event.data && typeof event.data === "object" ? event.data : null;
        const message = data && data.pluginMessage;
        if (!message) return;
        const text = getText();

        if (message.type === "capture-success") {
          if (message.target === "design") {
            state.designImage = message.payload.imageDataUrl;
            state.designName = message.payload.name;
            setStatus(text.capturedDesign(message.payload.name));
          } else {
            state.devImage = message.payload.imageDataUrl;
            state.devName = message.payload.name;
            setStatus(text.capturedDev(message.payload.name));
          }
          return;
        }

        if (message.type === "capture-error") {
          setStatus(message.message, "error");
          return;
        }

        if (message.type === "analyze-success") {
          state.loading = false;
          state.report = message.report;
          setStatus(text.analyzeReturned((message.report.issues || []).length));
          return;
        }

        if (message.type === "analyze-error") {
          state.loading = false;
          setStatus(message.message, "error");
          return;
        }

        if (message.type === "highlight-success") {
          setStatus(text.highlighted(message.count));
          return;
        }

        if (message.type === "highlight-error") {
          setStatus(message.message, "error");
          return;
        }

        if (message.type === "clear-highlight-success") {
          setStatus(text.clearedHighlights);
          return;
        }

        if (message.type === "api-key-loaded") {
          if (message.provider === state.provider && message.model === state.model) {
            state.apiKey = message.apiKey || "";
            render();
          }
        }

        if (message.type === "settings-loaded") {
          if (message.provider && message.model) {
            state.provider = message.provider;
            state.model = message.model;
            state.apiKey = message.apiKey || "";
            storage.set("ui-review-provider", state.provider);
            storage.set("ui-review-model", state.model);
            render();
          } else if (state.provider && state.model) {
            rememberSelection(state.provider, state.model);
            requestRememberedApiKey(state.provider, state.model);
          }
        }
      };

      state.extraInstruction = storage.get("ui-review-extra") || DEFAULT_EXTRA[state.language];
      state.apiKey = loadRememberedApiKey(state.provider, state.model);
      requestRememberedApiKey(state.provider, state.model);
      requestRememberedSettings();

      elements.extraInstructionInput.addEventListener("change", function (event) {
        state.extraInstruction = event.target.value;
        storage.set("ui-review-extra", state.extraInstruction);
      });

      randomizeFlowLines();
      requestAdaptivePluginHeight(true);
      render();
      } catch (error) {
        renderFatalStartupError(error);
      }
      })();
    </script>
  </body>
</html>
`;
