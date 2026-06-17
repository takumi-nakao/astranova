/**
 * ==========================================================================
 * AstraNova OFFICIAL WEBSITE - CONTACT / APPLICATION SERVERLESS API
 * ==========================================================================
 * 
 * パス: /api/contact
 * メソッド: POST
 * 
 * 本ファイルは、AstraNova加入・所属応募フォームの送信データを受信し、
 * サーバーサイド検証、Cloudflare TurnstileによるBot防御検証を行い、
 * Resend APIを介してチーム運営宛てに応募メール（HTML）を転送します。
 */

// HTMLエスケープ（XSS/インジェクション防御）
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// メールアドレス正規表現検証 (RFC準拠)
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return typeof email === 'string' && emailRegex.test(email);
}

// URL形式の検証（セキュリティ保護のためhttpsのみ許容）
function isValidURL(urlStr) {
  if (!urlStr) return true; // 任意項目のため空は許可
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

module.exports = async (req, res) => {
  // CORS保護およびPOSTメソッド制限
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'POSTメソッドのみ許可されています。'
    });
  }

  try {
    const { name, email, age, discord, role, portfolio, message, turnstileToken } = req.body;

    // サーバーサイド・入力値バリデーション
    const errors = {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'お名前を入力してください。';
    } else if (name.length > 100) {
      errors.name = 'お名前は100文字以内で入力してください。';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = '有効なメールアドレスを入力してください。';
    }

    const ageVal = parseInt(age, 10);
    if (isNaN(ageVal) || ageVal < 12 || ageVal > 100) {
      errors.age = '有効な年齢（12〜100）を入力してください。';
    }

    if (!discord || typeof discord !== 'string' || discord.trim().length === 0) {
      errors.discord = 'Discordユーザー名を入力してください。';
    }

    const validRoles = ['apex_player', 'valorant_player', 'streamer', 'coach_analyst', 'staff_creator'];
    if (!role || !validRoles.includes(role)) {
      errors.role = '希望部門・職種を正しく選択してください。';
    }

    if (portfolio && !isValidURL(portfolio)) {
      errors.portfolio = '有効なURL形式（http:// または https://）で入力してください。';
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.message = '自己PR・実績は10文字以上で入力してください。';
    } else if (message.length > 2000) {
      errors.message = '自己PR・実績は2000文字以内で入力してください。';
    }

    if (!turnstileToken || typeof turnstileToken !== 'string') {
      errors.turnstile = 'セキュリティトークンが確認できません。';
    }

    // 検証エラーがある場合は 400 Bad Request を返す
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '入力データに不備があります。',
        details: errors
      });
    }

    // Cloudflare Turnstile スパム判定検証
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      console.warn('[Warning] TURNSTILE_SECRET_KEY is not defined. Skipping token verification.');
    } else {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: clientIp
        })
      });

      const verifyResult = await verifyRes.json();
      if (!verifyResult.success) {
        return res.status(403).json({
          success: false,
          error: 'SPAM_DETECTED',
          message: 'セキュリティ検証（Bot検知）に合格しませんでした。やり直してください。'
        });
      }
    }

    // サニタイジング処理
    const cleanName = escapeHTML(name.trim());
    const cleanEmail = escapeHTML(email.trim());
    const cleanAge = ageVal;
    const cleanDiscord = escapeHTML(discord.trim());
    const cleanPortfolio = portfolio ? escapeHTML(portfolio.trim()) : '未記入';
    const cleanMessage = escapeHTML(message.trim()).replace(/\n/g, '<br>');

    // 表示用の職種ラベル変換
    const roleLabels = {
      apex_player: 'APEX LEGENDS 部門 (選手)',
      valorant_player: 'VALORANT 部門 (選手)',
      streamer: 'ストリーマー部門',
      coach_analyst: 'コーチ・アナリスト',
      staff_creator: 'クリエイター・運営スタッフ'
    };
    const roleLabel = roleLabels[role] || role;

    // Resend メール送信処理
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.TO_EMAIL || 'owner@example.com';

    if (!resendApiKey) {
      console.log('--- [AstraNova Demo] Resend API key is not configured. Print payload: ---');
      console.log(`Applicant: ${cleanName} (${cleanAge}歳)`);
      console.log(`Role: ${roleLabel}`);
      console.log(`Discord: ${cleanDiscord}`);
      console.log(`Email: ${cleanEmail}`);
      console.log(`Portfolio: ${cleanPortfolio}`);
      console.log(`Message:\n${cleanMessage}`);
      console.log('------------------------------------------------------------------');

      return res.status(200).json({
        success: true,
        message: '【デモモード】エントリーの送信データをコンソールに出力しました（APIキー未設定）。'
      });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AstraNova Application <onboarding@resend.dev>',
        to: toEmail,
        subject: `[AstraNova Apply] ${roleLabel} - ${cleanName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0a0b10; color: #ffffff; border: 1px solid #1a1024; border-radius: 8px;">
            <div style="border-bottom: 2px solid #8f00ff; padding-bottom: 15px; margin-bottom: 25px;">
              <h2 style="margin: 0; color: #00f3ff; font-size: 20px; letter-spacing: 2px;">ASTRA NOVA - APPLICATION ENTRY</h2>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; width: 140px; font-weight: bold;">お名前</td>
                <td style="padding: 10px 0; color: #ffffff;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; font-weight: bold;">年齢</td>
                <td style="padding: 10px 0; color: #ffffff;">${cleanAge} 歳</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; font-weight: bold;">メールアドレス</td>
                <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:${cleanEmail}" style="color: #00f3ff; text-decoration: none;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; font-weight: bold;">Discord ID</td>
                <td style="padding: 10px 0; color: #ffffff;">${cleanDiscord}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; font-weight: bold;">希望職種</td>
                <td style="padding: 10px 0; color: #00f3ff; font-weight: bold;">${roleLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8f8f8f; font-weight: bold;">SNS・実績URL</td>
                <td style="padding: 10px 0; color: #ffffff;">
                  ${cleanPortfolio !== '未記入' ? `<span style="color: #ffffff; word-break: break-all;">${cleanPortfolio}</span>` : '未記入'}
                </td>
              </tr>
            </table>

            <div style="background-color: #1a1024; border: 1px solid #3b1f4a; padding: 20px; border-radius: 4px; line-height: 1.6; color: #e5e5e5; white-space: pre-wrap;">
              <h3 style="margin-top: 0; color: #00f3ff; font-size: 14px;">自己PR・競技実績・意気込み:</h3>
              ${cleanMessage}
            </div>

            <div style="margin-top: 30px; font-size: 11px; color: #525252; text-align: center; border-top: 1px solid #1a1024; padding-top: 15px;">
              送信日時: ${new Date().toISOString()}<br>
              ※本メールは AstraNova メンバー募集・応募フォームより送信されました。
            </div>
          </div>
        `
      })
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API Error:', emailResult);
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'エントリーのメール送信に失敗しました。'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'エントリーが完了しました。ご応募いただきありがとうございます。'
    });

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'サーバー内部でエラーが発生しました。'
    });
  }
};
