import { useState } from 'react';
import { Settings } from 'lucide-react';
import { getSfxVolume, setSfxVolume, getMusicVolume, setMusicVolume, getFrogsEnabled, setFrogsEnabled } from './SoundEffects';

const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const [sfx, setSfx] = useState(getSfxVolume());
  const [music, setMusic] = useState(getMusicVolume());
  const [frogs, setFrogs] = useState(getFrogsEnabled());

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          borderRadius: 8,
          padding: 10,
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Settings size={24} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 16,
            zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            borderRadius: 12,
            padding: 20,
            color: 'white',
            minWidth: 220,
            fontFamily: 'sans-serif',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Настройки</h3>

          <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Звуковые эффекты: {Math.round(sfx * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sfx}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setSfx(v);
              setSfxVolume(v);
            }}
            style={{ width: '100%', marginBottom: 16 }}
          />

          <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Фоновая музыка: {Math.round(music * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={music}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setMusic(v);
              setMusicVolume(v);
            }}
            style={{ width: '100%', marginBottom: 16 }}
          />

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={frogs}
              onChange={(e) => {
                const v = e.target.checked;
                setFrogs(v);
                setFrogsEnabled(v);
              }}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            Лягушки
          </label>

          <button
            onClick={() => window.dispatchEvent(new Event('reset-shot-count'))}
            style={{
              width: '100%',
              padding: '8px',
              background: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            Сбросить счётчик снарядов
          </button>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
