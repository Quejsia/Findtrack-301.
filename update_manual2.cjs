const fs = require('fs');

const manualTranslations = {
  // Search page
  "Find Lost Items": { fr: "Trouver des objets perdus", zh: "寻找丢失物品", fil: "Maghanap ng mga Nawawalang Bagay", es: "Encontrar artículos perdidos" },
  "Search through our community database to find what you're looking for.": { fr: "Recherchez dans notre base de données communautaire pour trouver ce que vous cherchez.", zh: "在我们的社区数据库中搜索以查找您要找的物品。", fil: "Maghanap sa aming community database para mahanap ang hinahanap mo.", es: "Busque en nuestra base de datos de la comunidad para encontrar lo que busca." },
  "Search by keywords, brands, or descriptions...": { fr: "Rechercher par mots-clés, marques ou descriptions...", zh: "按关键字、品牌或描述搜索...", fil: "Maghanap gamit ang mga keyword, brand, o paglalarawan...", es: "Buscar por palabras clave, marcas o descripciones..." },
  "STATUS": { fr: "STATUT", zh: "状态", fil: "KATAYUAN", es: "ESTADO" },
  "All Items": { fr: "Tous les articles", zh: "所有物品", fil: "Lahat ng Bagay", es: "Todos los artículos" },
  "LOCATION": { fr: "EMPLACEMENT", zh: "位置", fil: "LOKASYON", es: "UBICACIÓN" },
  "Type location...": { fr: "Taper l'emplacement...", zh: "输入位置...", fil: "I-type ang lokasyon...", es: "Escriba la ubicación..." },
  "Search Results (": { fr: "Résultats de recherche (", zh: "搜索结果 (", fil: "Mga Resulta ng Paghahanap (", es: "Resultados de búsqueda (" },
  " found)": { fr: " trouvés)", zh: " 个)", fil: " nahanap)", es: " encontrados)" },
  "View Details": { fr: "Voir les détails", zh: "查看详情", fil: "Tingnan ang mga Detalye", es: "Ver detalles" },
  "View details": { fr: "Voir les détails", zh: "查看详情", fil: "Tingnan ang mga detalye", es: "Ver detalles" },

  // Profile page
  "Community Member": { fr: "Membre de la communauté", zh: "社区成员", fil: "Miyembro ng Komunidad", es: "Miembro de la comunidad" },
  "Location not set": { fr: "Emplacement non défini", zh: "位置未设置", fil: "Hindi nakatakda ang lokasyon", es: "Ubicación no establecida" },
  "Update your profile to add a bio.": { fr: "Mettez à jour votre profil pour ajouter une bio.", zh: "更新您的个人资料以添加简介。", fil: "I-update ang iyong profile para magdagdag ng bio.", es: "Actualice su perfil para agregar una biografía." },
  "Edit Profile": { fr: "Modifier le profil", zh: "编辑个人资料", fil: "I-edit ang Profile", es: "Editar perfil" },
  "Impact Stats": { fr: "Statistiques d'impact", zh: "影响统计", fil: "Mga Stats ng Epekto", es: "Estadísticas de impacto" },
  "Items Reported": { fr: "Objets signalés", zh: "报告的物品", fil: "Mga Iniulat na Bagay", es: "Artículos reportados" },
  "Reunited": { fr: "Réunis", zh: "已找回", fil: "Naibalik", es: "Reunidos" },
  "Personal Information": { fr: "Informations personnelles", zh: "个人信息", fil: "Personal na Impormasyon", es: "Información personal" },
  "Display Name": { fr: "Nom d'affichage", zh: "显示名称", fil: "Display Name", es: "Nombre para mostrar" },
  "Bio": { fr: "Bio", zh: "简介", fil: "Bio", es: "Biografía" },
  "Email Address": { fr: "Adresse e-mail", zh: "电子邮件地址", fil: "Email Address", es: "Dirección de correo electrónico" },
  "Email verified": { fr: "E-mail vérifié", zh: "电子邮件已验证", fil: "Na-verify na ang email", es: "Correo electrónico verificado" },
  "Phone Number": { fr: "Numéro de téléphone", zh: "电话号码", fil: "Numero ng Telepono", es: "Número de teléfono" },
  "Primary Location": { fr: "Emplacement principal", zh: "主要位置", fil: "Pangunahing Lokasyon", es: "Ubicación principal" },
  "Save Changes": { fr: "Enregistrer les modifications", zh: "保存更改", fil: "I-save ang mga Pagbabago", es: "Guardar cambios" },
  "Notification Preferences": { fr: "Préférences de notification", zh: "通知偏好", fil: "Mga Kagustuhan sa Notification", es: "Preferencias de notificación" },
  "New matches for my items": { fr: "Nouvelles correspondances pour mes objets", zh: "我的物品的新匹配项", fil: "Mga bagong match para sa aking mga bagay", es: "Nuevas coincidencias para mis artículos" },
  "Get notified when a found item matches your report.": { fr: "Soyez averti lorsqu'un objet trouvé correspond à votre signalement.", zh: "当找到的物品与您的报告匹配时收到通知。", fil: "Maabisuhan kapag ang isang nahanap na bagay ay tumugma sa iyong ulat.", es: "Reciba una notificación cuando un artículo encontrado coincida con su reporte." },
  "Community Alerts": { fr: "Alertes communautaires", zh: "社区提醒", fil: "Mga Alerto ng Komunidad", es: "Alertas de la comunidad" },
  "Important alerts in your primary location.": { fr: "Alertes importantes dans votre emplacement principal.", zh: "您主要位置的重要提醒。", fil: "Mahalagang alerto sa iyong pangunahing lokasyon.", es: "Alertas importantes en su ubicación principal." },
  "Security": { fr: "Sécurité", zh: "安全", fil: "Seguridad", es: "Seguridad" },
  "Change Password": { fr: "Changer le mot de passe", zh: "修改密码", fil: "Palitan ang Password", es: "Cambiar contraseña" },
  "Update your security credentials": { fr: "Mettez à jour vos identifiants de sécurité", zh: "更新您的安全凭据", fil: "I-update ang iyong security credentials", es: "Actualice sus credenciales de seguridad" },
  "Sign Out Everywhere": { fr: "Se déconnecter partout", zh: "在所有设备上注销", fil: "Mag-sign Out Kahit Saan", es: "Cerrar sesión en todos lados" },

  // Item Detail page
  "Back to Results": { fr: "Retour aux résultats", zh: "返回结果", fil: "Bumalik sa mga Resulta", es: "Volver a los resultados" },
  "Ref #": { fr: "Réf #", zh: "参考编号 #", fil: "Ref #", es: "Ref #" },
  "Gemini AI Matchmaker": { fr: "Gemini AI Matchmaker", zh: "Gemini AI 匹配器", fil: "Gemini AI Matchmaker", es: "Gemini AI Matchmaker" },
  "Scanning local databases...": { fr: "Analyse des bases de données locales...", zh: "正在扫描本地数据库...", fil: "Ini-scan ang mga lokal na database...", es: "Escaneando bases de datos locales..." },
  "Item Details": { fr: "Détails de l'article", zh: "物品详情", fil: "Mga Detalye ng Bagay", es: "Detalles del artículo" },
  "Category": { fr: "Catégorie", zh: "类别", fil: "Kategorya", es: "Categoría" },
  "Date Logged": { fr: "Date d'enregistrement", zh: "记录日期", fil: "Petsa Inilog", es: "Fecha de registro" },
  "Description": { fr: "Description", zh: "描述", fil: "Paglalarawan", es: "Descripción" },
  "Contact Credentials": { fr: "Coordonnées de contact", zh: "联系凭据", fil: "Mga Kredensyal sa Pakikipag-ugnayan", es: "Credenciales de contacto" },
  "Reporter": { fr: "Signalé par", zh: "报告人", fil: "Nag-ulat", es: "Reportado por" },
  "Contact Chat Room": { fr: "Salle de discussion de contact", zh: "联系聊天室", fil: "Chat Room para sa Pakikipag-ugnayan", es: "Sala de chat de contacto" },
  "Log Ownership Claim": { fr: "Enregistrer une réclamation de propriété", zh: "记录所有权声明", fil: "I-log ang Claim ng Pagmamay-ari", es: "Registrar reclamo de propiedad" },

  // Report an Item
  "I am reporting a...": { fr: "Je signale un...", zh: "我正在报告一个...", fil: "Ako ay nag-uulat ng...", es: "Estoy reportando un..." },
  "Lost Item": { fr: "Objet Perdu", zh: "丢失物品", fil: "Nawawalang Bagay", es: "Artículo Perdido" },
  "Found Item": { fr: "Objet Trouvé", zh: "Trouvé", fil: "Nahanap na Bagay", es: "Artículo Encontrado" },
  "Item Title": { fr: "Titre de l'article", zh: "物品标题", fil: "Pamagat ng Bagay", es: "Título del artículo" },
  "Location Lost": { fr: "Lieu de perte", zh: "丢失地点", fil: "Lokasyon kung saan nawala", es: "Lugar de pérdida" },
  "Location Found": { fr: "Lieu de découverte", zh: "发现地点", fil: "Lokasyon kung saan nahanap", es: "Lugar donde se encontró" },
  "Continue": { fr: "Continuer", zh: "继续", fil: "Magpatuloy", es: "Continuar" }
};

const i18nDir = 'src/i18n/locales';
const codes = ['en', 'fr', 'zh', 'fil', 'es'];

codes.forEach(c => {
  const file = `${i18nDir}/${c}.json`;
  let data = {};
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file));
  }
  if (!data.search) data.search = {};
  if (!data.profile) data.profile = {};
  if (!data.itemDetail) data.itemDetail = {};
  if (!data.report) data.report = {};
  
  for (const [eng, trans] of Object.entries(manualTranslations)) {
    // Generate key based on english string (camelCase, remove non-alphanumeric)
    let key = eng.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + eng.split(' ').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase().replace(/[^a-z0-9]/g, '')).join('');
    // handle special cases
    if (eng === "Search Results (") key = "searchResultsStart";
    if (eng === " found)") key = "searchResultsEnd";
    
    // Assign to appropriate section based on some keywords or manually
    let section = "search";
    if (["Find Lost Items", "Search through our community database to find what you're looking for.", "Search by keywords, brands, or descriptions...", "STATUS", "All Items", "LOCATION", "Type location...", "Search Results (", " found)", "View Details", "View details"].includes(eng)) section = "search";
    else if (["Community Member", "Location not set", "Update your profile to add a bio.", "Edit Profile", "Impact Stats", "Items Reported", "Reunited", "Personal Information", "Display Name", "Bio", "Email Address", "Email verified", "Phone Number", "Primary Location", "Save Changes", "Notification Preferences", "New matches for my items", "Get notified when a found item matches your report.", "Community Alerts", "Important alerts in your primary location.", "Security", "Change Password", "Update your security credentials", "Sign Out Everywhere"].includes(eng)) section = "profile";
    else if (["Back to Results", "Ref #", "Gemini AI Matchmaker", "Scanning local databases...", "Item Details", "Category", "Date Logged", "Location", "Description", "Contact Credentials", "Reporter", "Contact Chat Room", "Log Ownership Claim"].includes(eng)) section = "itemDetail";
    else if (["I am reporting a...", "Lost Item", "Found Item", "Item Title", "Location Lost", "Location Found", "Continue"].includes(eng)) section = "report";
    
    if (c === 'en') {
      data[section][key] = eng;
    } else {
      data[section][key] = trans[c];
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
});

console.log("JSON locales updated.");
