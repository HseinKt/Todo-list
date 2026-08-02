import React, { useState } from 'react';
import { Shield, Smartphone, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  const [isMfaEnabled, setIsMfaEnabled] = useState(user?.twoFactorEnabled || false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleStartMfaSetup = () => {
    setSecretKey('KVKU4T2GNRUDO4JS');
    setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/HorizonOS:you@domain.com?secret=KVKU4T2GNRUDO4JS&issuer=HorizonOS');
    setIsMfaModalOpen(true);
  };

  const handleVerifyMfaSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode.length === 6) {
      setIsMfaEnabled(true);
      setIsMfaModalOpen(false);
    }
  };

  const handleDisableMfa = () => {
    setIsMfaEnabled(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your account profile, personal preferences, and security configurations.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <User size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Profile Configuration
            </h3>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Shield size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Security & Multifactor Auth
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-secondary/30 rounded-xl border border-border/40">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-accent/10 text-accent rounded-xl shrink-0 mt-0.5">
                <Smartphone size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">
                  Two-Factor Authentication (TOTP)
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
                  Protect your workspace by requiring an extra 6-digit security code from your authenticator app (like Google Authenticator or Duo) when signing in.
                </p>
              </div>
            </div>

            {isMfaEnabled ? (
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
                <Button variant="outline" size="sm" onClick={handleDisableMfa} className="text-destructive border-destructive/25 hover:bg-destructive/5 hover:border-destructive/40 text-xs py-1.5 px-3">
                  Disable
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-muted-foreground font-bold px-2 py-0.5 rounded-full border border-border/40">
                  Inactive
                </span>
                <Button variant="primary" size="sm" onClick={handleStartMfaSetup} className="text-xs py-1.5 px-3">
                  Enable MFA
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={isMfaModalOpen} onClose={() => setIsMfaModalOpen(false)} title="Configure Two-Factor Authentication">
        <form onSubmit={handleVerifyMfaSetup} className="space-y-5 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Scan the QR code below using your authenticator application, or manually register the secret key.
          </p>

          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-900 border border-border rounded-xl w-fit mx-auto shadow-apple-sm">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-[150px] h-[150px]" />
            ) : (
              <div className="w-[150px] h-[150px] bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                Generating QR...
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-left bg-secondary/35 p-3 rounded-lg border border-border/40">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Secret Key</span>
            <code className="text-xs font-mono font-bold text-foreground select-all break-all">{secretKey}</code>
          </div>

          <Input
            label="Enter 6-Digit Code to verify"
            placeholder="e.g. 123456"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            maxLength={6}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsMfaModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Verify & Enable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
