const fs = require('fs');

const manualTranslations = {
  "Items Reported": { fr: "Objets Signalés", zh: "报告物品", fil: "Mga Iniulat na Bagay", es: "Artículos Reportados" },
  "Items Found": { fr: "Objets Trouvés", zh: "找到的物品", fil: "Mga Nahanap na Bagay", es: "Artículos Encontrados" },
  "Community Members": { fr: "Membres de la Communauté", zh: "社区成员", fil: "Miyembro ng Komunidad", es: "Miembros de la Comunidad" },
  "Recoveries This Week": { fr: "Récupérations cette semaine", zh: "本周找回", fil: "Nabawi Ngayong Linggo", es: "Recuperaciones esta Semana" },
  "Recent Community Activity": { fr: "Activité Récente de la Communauté", zh: "近期社区活动", fil: "Kamakailang Aktibidad sa Komunidad", es: "Actividad Reciente de la Comunidad" },
  "Private Messages": { fr: "Messages Privés", zh: "私人消息", fil: "Pribadong Mensahe", es: "Mensajes Privados" },
  "No messages yet": { fr: "Aucun message pour le moment", zh: "暂无消息", fil: "Wala pang mensahe", es: "No hay mensajes aún" },
  "When someone contacts you about your reported item, it will appear here.": { fr: "Lorsque quelqu'un vous contactera concernant votre objet signalé, cela apparaîtra ici.", zh: "当有人就您报告的物品与您联系时，消息将显示在此处。", fil: "Kapag may kumontak sa iyo tungkol sa inulat mong bagay, lilitaw ito rito.", es: "Cuando alguien te contacte sobre tu artículo reportado, aparecerá aquí." },
  "Report an Item": { fr: "Signaler un Objet", zh: "报告物品", fil: "Mag-ulat ng Bagay", es: "Reportar un Artículo" },
  "Fill in the details below. Our smart matching system will help find the owner or the item.": { fr: "Remplissez les détails ci-dessous. Notre système intelligent aidera à trouver le propriétaire ou l'objet.", zh: "请在下方填写详细信息。我们的智能匹配系统将帮助寻找失主或物品。", fil: "Punan ang mga detalye sa ibaba. Tutulong ang aming smart matching system na mahanap ang may-ari o ang bagay.", es: "Complete los detalles a continuación. Nuestro sistema inteligente ayudará a encontrar al propietario o el artículo." },
  "1. Basic Info": { fr: "1. Infos de Base", zh: "1. 基本信息", fil: "1. Pangunahing Impormasyon", es: "1. Información Básica" },
  "2. Details": { fr: "2. Détails", zh: "2. 详情", fil: "2. Mga Detalye", es: "2. Detalles" },
  "3. Verification": { fr: "3. Vérification", zh: "3. 验证", fil: "3. Beripikasyon", es: "3. Verificación" },
  "Lost": { fr: "Perdu", zh: "丢失", fil: "Nawawala", es: "Perdido" },
  "Found": { fr: "Trouvé", zh: "找到", fil: "Nahanap", es: "Encontrado" },
  "No recent activity.": { fr: "Aucune activité récente.", zh: "近期无活动。", fil: "Walang kamakailang aktibidad.", es: "No hay actividad reciente." },
  "Every recovered item strengthens the community.": { fr: "Chaque objet récupéré renforce la communauté.", zh: "每一次找回都让社区更加紧密。", fil: "Bawat nabawing bagay ay nagpapalakas sa komunidad.", es: "Cada artículo recuperado fortalece a la comunidad." }
};

const i18nDir = 'src/i18n/locales';
const codes = ['en', 'fr', 'zh', 'fil', 'es'];

codes.forEach(c => {
  const file = `${i18nDir}/${c}.json`;
  let data = {};
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file));
  }
  if (!data.dashboard) data.dashboard = {};
  
  for (const [eng, trans] of Object.entries(manualTranslations)) {
    // Generate key based on english string (camelCase, remove non-alphanumeric)
    const key = eng.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + eng.split(' ').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase().replace(/[^a-z0-9]/g, '')).join('');
    
    if (c === 'en') {
      data.dashboard[key] = eng;
    } else {
      data.dashboard[key] = trans[c];
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
});

console.log("JSON locales updated.");
