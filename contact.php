<?php
/* =========================================
   Form Processing
========================================= */
$errors  = [];
$old     = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  // 取得 & トリム
  $old['name']     = trim($_POST['name']     ?? '');
  $old['email']    = trim($_POST['email']    ?? '');
  $old['tel']      = trim($_POST['tel']      ?? '');
  $old['type']     = trim($_POST['type']     ?? '');
  $old['message']  = trim($_POST['message']  ?? '');
  $old['budget']   = trim($_POST['budget']   ?? '');
  $old['deadline'] = trim($_POST['deadline'] ?? '');

  // ヘッダーインジェクション対策
  foreach (['name', 'email', 'tel', 'type', 'budget', 'deadline'] as $f) {
    if (preg_match('/[\r\n]/', $old[$f])) {
      $errors[] = '不正な入力が含まれています。';
      break;
    }
  }

  // バリデーション
  if ($old['name'] === '')    $errors[] = '名前を入力してください。';
  if ($old['email'] === '') {
    $errors[] = 'メールアドレスを入力してください。';
  } elseif (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません。';
  }
  if ($old['type'] === '')    $errors[] = 'ご相談の種別を選択してください。';
  if ($old['message'] === '') $errors[] = 'ご相談内容を入力してください。';
  if ($old['budget'] === '')  $errors[] = 'ご予算を選択してください。';

  if (empty($errors)) {
    mb_language('uni');
    mb_internal_encoding('UTF-8');

    $admin_to   = 'info@k-web-studio-km.com';
    $from_addr  = 'noreply@k-web-studio-km.com';
    $site_name  = 'YAMADA WEB DESIGN';

    // ── 管理者宛メール ──
    $admin_subject = '【お問い合わせ】' . $old['name'] . ' 様よりお問い合わせがありました';
    $admin_body    = implode("\n", [
      'お問い合わせがありました。',
      str_repeat('─', 30),
      '■ 名前',
      $old['name'],
      '',
      '■ メールアドレス',
      $old['email'],
      '',
      '■ 電話番号',
      $old['tel'] !== '' ? $old['tel'] : '（未入力）',
      '',
      '■ ご相談の種別',
      $old['type'],
      '',
      '■ ご相談内容',
      $old['message'],
      '',
      '■ ご予算',
      $old['budget'],
      '',
      '■ 希望納期',
      $old['deadline'] !== '' ? $old['deadline'] : '（未入力）',
      str_repeat('─', 30),
    ]);
    $admin_headers = "From: {$from_addr}\r\nReply-To: {$old['email']}";
    mb_send_mail($admin_to, $admin_subject, $admin_body, $admin_headers);

    // ── 自動返信メール ──
    $reply_subject = '【自動返信】お問い合わせを受け付けました | ' . $site_name;
    $reply_body    = implode("\n", [
      $old['name'] . ' 様',
      '',
      'お問い合わせいただきありがとうございます。',
      '以下の内容で受け付けました。',
      '2〜3営業日以内にご返信いたします。',
      '',
      str_repeat('─', 30),
      '■ ご相談の種別',
      $old['type'],
      '',
      '■ ご相談内容',
      $old['message'],
      '',
      '■ ご予算',
      $old['budget'],
      str_repeat('─', 30),
      '',
      '※ このメールは自動送信です。このメールへの返信はお受けできません。',
      $site_name,
      'https://new.k-web-studio-km.com',
    ]);
    $reply_headers = "From: {$admin_to}";
    mb_send_mail($old['email'], $reply_subject, $reply_body, $reply_headers);

    header('Location: thanks.php');
    exit;
  }
}

// エスケープ用ヘルパー
function h($str) { return htmlspecialchars($str, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ | YAMADA WEB DESIGN</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="top.css">
  <link rel="stylesheet" href="contact.css">
</head>
<body>

  <!-- ===== Header ===== -->
  <header class="header" id="header">
    <div class="header__inner">
      <a href="index.html" class="header__logo">YAMADA WEB DESIGN</a>
      <nav class="global-nav">
        <ul class="global-nav__list">
          <li><a href="index.html#about"   class="global-nav__link">私について</a></li>
          <li><a href="index.html#service" class="global-nav__link">事業内容</a></li>
          <li><a href="works.html"         class="global-nav__link">制作実績</a></li>
          <li><a href="contact.php"        class="global-nav__link global-nav__link--btn">お問い合わせ</a></li>
        </ul>
      </nav>
      <button class="hamburger" id="hamburger" aria-label="メニュー" aria-expanded="false">
        <span class="hamburger__line"></span>
        <span class="hamburger__line"></span>
        <span class="hamburger__line"></span>
      </button>
    </div>
  </header>

  <!-- ===== Mobile Nav ===== -->
  <nav class="mobile-nav" id="mobileNav">
    <button class="mobile-nav__close" id="mobileNavClose" aria-label="閉じる">
      <span></span><span></span>
    </button>
    <ul class="mobile-nav__list">
      <li><a href="index.html#about"   class="mobile-nav__link">私について</a></li>
      <li><a href="index.html#service" class="mobile-nav__link">事業内容</a></li>
      <li><a href="works.html"         class="mobile-nav__link">制作実績</a></li>
      <li><a href="contact.php"        class="mobile-nav__link">お問い合わせ</a></li>
    </ul>
  </nav>
  <div class="mobile-nav__overlay" id="mobileNavOverlay"></div>

  <main>
    <section class="cp">
      <div class="container">
        <div class="cp__grid">

          <!-- ===== Left: Info ===== -->
          <div class="cp-info">
            <p class="lbl">CONTACT</p>
            <h1 class="cp-info__title">お問い合わせ<br>ご相談</h1>
            <p class="cp-info__desc">
              制作に関するご相談やお問い合わせは、必要事項をご入力の上、送信してください。<br>
              お見積りのみのご依頼もお受けしています。
            </p>
            <p class="cp-info__reply">2〜3営業日以内に担当よりメールにてご返信いたします。</p>
            <p class="cp-info__req">※ <em>*</em> が付いている項目は必須です</p>

            <dl class="cp-info__cards">
              <div class="cp-info__card">
                <dt>無料相談</dt>
                <dd>ご要件・ご予算感など、まずはお気軽にご相談ください。</dd>
              </div>
              <div class="cp-info__card">
                <dt>お見積り</dt>
                <dd>ご要件をお伺いした上で、無料でお見積りいたします。</dd>
              </div>
              <div class="cp-info__card">
                <dt>秘密厳守</dt>
                <dd>お問い合わせ内容は厳重に管理いたします。</dd>
              </div>
            </dl>
          </div>

          <!-- ===== Right: Form ===== -->
          <form class="c-form" action="contact.php" method="post" novalidate>

            <?php if (!empty($errors)): ?>
            <div class="c-form__errors">
              <ul>
                <?php foreach ($errors as $e): ?>
                <li><?= h($e) ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
            <?php endif; ?>

            <!-- 名前 -->
            <div class="c-form__group">
              <label class="c-form__label">名前 <span class="c-form__req">*</span></label>
              <input type="text" class="c-form__input" name="name" autocomplete="name" required value="<?= h($old['name'] ?? '') ?>">
            </div>

            <!-- メール -->
            <div class="c-form__group">
              <label class="c-form__label">メールアドレス <span class="c-form__req">*</span></label>
              <input type="email" class="c-form__input" name="email" autocomplete="email" required value="<?= h($old['email'] ?? '') ?>">
            </div>

            <!-- 電話番号 -->
            <div class="c-form__group">
              <label class="c-form__label">電話番号</label>
              <input type="tel" class="c-form__input" name="tel" autocomplete="tel" value="<?= h($old['tel'] ?? '') ?>">
            </div>

            <!-- ご相談の種別 -->
            <div class="c-form__group">
              <label class="c-form__label">ご相談の種別 <span class="c-form__req">*</span></label>
              <select class="c-form__select" name="type" required>
                <option value="" disabled <?= empty($old['type']) ? 'selected' : '' ?>>選択してください</option>
                <?php
                $types = ['Webサイト制作（コーポレート）','LP制作','採用サイト制作','ECサイト制作','デザイン設計・UI改善','SEO対策','保守・運用','その他'];
                foreach ($types as $t):
                ?>
                <option <?= (($old['type'] ?? '') === $t) ? 'selected' : '' ?>><?= h($t) ?></option>
                <?php endforeach; ?>
              </select>
            </div>

            <!-- ご相談内容 -->
            <div class="c-form__group">
              <label class="c-form__label">ご相談内容 <span class="c-form__req">*</span></label>
              <textarea class="c-form__textarea" name="message" rows="5" required><?= h($old['message'] ?? '') ?></textarea>
            </div>

            <!-- ご予算 -->
            <div class="c-form__group">
              <label class="c-form__label">ご予算 <span class="c-form__req">*</span></label>
              <select class="c-form__select" name="budget" required>
                <option value="" disabled <?= empty($old['budget']) ? 'selected' : '' ?>>選択してください</option>
                <?php
                $budgets = ['30万円未満','30〜50万円','50〜100万円','100〜200万円','200万円以上','未定・要相談'];
                foreach ($budgets as $b):
                ?>
                <option <?= (($old['budget'] ?? '') === $b) ? 'selected' : '' ?>><?= h($b) ?></option>
                <?php endforeach; ?>
              </select>
            </div>

            <!-- 希望納期 -->
            <div class="c-form__group">
              <label class="c-form__label">希望納期</label>
              <input type="text" class="c-form__input" name="deadline" placeholder="例）2025年9月ごろ" value="<?= h($old['deadline'] ?? '') ?>">
            </div>

            <!-- Submit -->
            <div class="c-form__footer">
              <button type="submit" class="c-form__submit btn btn--dark">送信する</button>
              <p class="c-form__privacy">
                <a href="#">個人情報保護方針</a>について同意したものとみなされます
              </p>
            </div>

          </form>

        </div>
      </div>
    </section>
  </main>

  <!-- ===== Footer ===== -->
  <footer class="footer">
    <div class="footer__inner container">
      <div class="footer__brand">
        <p class="footer__logo">YAMADA WEB DESIGN</p>
        <p class="footer__tagline">戦略設計からデザイン・構築・運用まで。</p>
      </div>
      <nav>
        <ul class="footer__nav-list">
          <li><a href="index.html#about">私について</a></li>
          <li><a href="index.html#service">事業内容</a></li>
          <li><a href="works.html">制作実績</a></li>
        </ul>
      </nav>
    </div>
  </footer>

  <script src="top.js"></script>
</body>
</html>
