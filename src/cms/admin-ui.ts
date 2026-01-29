import { store } from './store';

export function initAdminUI() {
  const adminBtn = document.createElement('button');
  adminBtn.innerText = '⚙️ Editar Sitio';
  adminBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
    padding: 10px 15px;
    background: #333;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: sans-serif;
    font-size: 14px;
  `;

  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 20px;
    width: 320px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 9999;
    font-family: sans-serif;
    display: none;
    max-height: 80vh;
    overflow-y: auto;
  `;

  document.body.appendChild(adminBtn);
  document.body.appendChild(panel);

  let isOpen = false;
  adminBtn.onclick = () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'block' : 'none';
    adminBtn.innerText = isOpen ? '❌ Cerrar Editor' : '⚙️ Editar Sitio';
    if (isOpen) renderForm();
  };

  function renderForm() {
    const data = store.get();

    // Simple tab navigation
    let activeTab = 'content'; // content | styles | settings

    const renderTabs = () => `
      <div style="display:flex; border-bottom:1px solid #ddd; margin-bottom:15px;">
        <button class="cms-tab" data-tab="content" style="flex:1; padding:10px; border:none; background:${activeTab === 'content' ? 'white' : '#f5f5f5'}; font-weight:${activeTab === 'content' ? 'bold' : 'normal'}; cursor:pointer; border-bottom:${activeTab === 'content' ? '2px solid #e85d04' : 'none'};">Contenido</button>
        <button class="cms-tab" data-tab="styles" style="flex:1; padding:10px; border:none; background:${activeTab === 'styles' ? 'white' : '#f5f5f5'}; font-weight:${activeTab === 'styles' ? 'bold' : 'normal'}; cursor:pointer; border-bottom:${activeTab === 'styles' ? '2px solid #e85d04' : 'none'};">Estilos</button>
        <button class="cms-tab" data-tab="settings" style="flex:1; padding:10px; border:none; background:${activeTab === 'settings' ? 'white' : '#f5f5f5'}; font-weight:${activeTab === 'settings' ? 'bold' : 'normal'}; cursor:pointer; border-bottom:${activeTab === 'settings' ? '2px solid #e85d04' : 'none'};">Config</button>
      </div>
    `;

    const renderContent = () => {
      panel.innerHTML = `
        <h3 style="margin-top:0; color:#333;">Editor CMS</h3>
        ${renderTabs()}
        
        <div id="tab-content" style="display:${activeTab === 'content' ? 'block' : 'none'}">
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Título Principal</label>
            <input type="text" id="cms-title" value="${data.hero.title}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Subtítulo</label>
            <input type="text" id="cms-subtitle" value="${data.hero.subtitle}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Descripción</label>
            <textarea id="cms-desc" rows="3" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">${data.hero.description}</textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666;">URL Imagen Fondo</label>
            <input type="text" id="cms-img" value="${data.hero.imageUrl}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Texto Botón</label>
            <input type="text" id="cms-cta" value="${data.hero.ctaText}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
          </div>
          <button id="cms-save-content" style="width:100%; padding:10px; background:#e85d04; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Guardar Contenido</button>
        </div>

        <div id="tab-styles" style="display:${activeTab === 'styles' ? 'block' : 'none'}">
          <div style="margin-bottom: 15px;">
             <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Color Título</label>
             <div style="display:flex; gap:10px;">
               <input type="color" id="style-title-color" value="${data.styles?.titleColor || '#0f3e5d'}" style="height:40px; border:none; background:none;">
               <input type="text" value="${data.styles?.titleColor || '#0f3e5d'}" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;" readonly>
             </div>
          </div>
          <div style="margin-bottom: 15px;">
             <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Tamaño Título (ej: 4rem, 60px)</label>
             <input type="text" id="style-title-size" value="${data.styles?.titleSize || '4rem'}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
          </div>
          <div style="margin-bottom: 15px;">
             <label style="display:block; font-size:12px; font-weight:bold; color:#666;">Color Botón (Fondo)</label>
             <div style="display:flex; gap:10px;">
               <input type="color" id="style-btn-color" value="${data.styles?.btnColor || '#e85d04'}" style="height:40px; border:none; background:none;">
             </div>
          </div>
           <button id="cms-save-styles" style="width:100%; padding:10px; background:#0f3e5d; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Aplicar Estilos</button>
        </div>

        <div id="tab-settings" style="display:${activeTab === 'settings' ? 'block' : 'none'}">
          <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-bottom:5px;">📍 Forzar Ubicación (Sede)</label>
            <p style="font-size:11px; color:#999; margin-bottom:10px;">"Auto-detectar" usa tu IP. Si falla o es inexacta, elige tu sede real aquí.</p>
            <select id="cms-force-sede" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
              <option value="" ${data.settings?.forceSede === "" ? "selected" : ""}>🤖 Auto-detectar (Recomendado)</option>
              ${data.sedes.map(s => `<option value="${s.id}" ${data.settings?.forceSede === s.id ? "selected" : ""}>${s.nombre}</option>`).join('')}
            </select>
          </div>
          <button id="cms-save-settings" style="width:100%; padding:10px; background:#333; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Guardar Configuración</button>
           <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
          <button id="cms-reset" style="width:100%; padding:8px; background:#eee; border:none; border-radius:4px; cursor:pointer; color:#555;">Restaurar Todo</button>
        </div>
      `;

      // Event Listeners
      document.querySelectorAll('.cms-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeTab = (e.target as HTMLElement).dataset.tab || 'content';
          renderContent();
        });
      });

      // Save Content
      document.getElementById('cms-save-content')?.addEventListener('click', () => {
        store.updateHero({
          title: (document.getElementById('cms-title') as HTMLInputElement).value,
          subtitle: (document.getElementById('cms-subtitle') as HTMLInputElement).value,
          description: (document.getElementById('cms-desc') as HTMLTextAreaElement).value,
          imageUrl: (document.getElementById('cms-img') as HTMLInputElement).value,
          ctaText: (document.getElementById('cms-cta') as HTMLInputElement).value,
        });
        alert('✅ Contenido actualizado');
      });

      // Save Styles
      document.getElementById('cms-save-styles')?.addEventListener('click', () => {
        store.updateStyles({
          titleColor: (document.getElementById('style-title-color') as HTMLInputElement).value,
          titleSize: (document.getElementById('style-title-size') as HTMLInputElement).value,
          btnColor: (document.getElementById('style-btn-color') as HTMLInputElement).value
        });
        alert('🎨 Estilos aplicados');
      });

      // Save Settings
      document.getElementById('cms-save-settings')?.addEventListener('click', () => {
        const forceSede = (document.getElementById('cms-force-sede') as HTMLSelectElement).value;
        store.updateSettings({ forceSede });
        alert(`📍 Ubicación forzada a: ${forceSede ? forceSede : 'Auto-detectar'}. Recarga la página para ver el cambio en el botón de WhatsApp.`);
        location.reload();
      });

      document.getElementById('cms-reset')?.addEventListener('click', () => {
        if (confirm('¿Restaurar todo a los valores originales?')) {
          store.reset();
          location.reload();
        }
      });
    };

    renderContent();
  }
}
