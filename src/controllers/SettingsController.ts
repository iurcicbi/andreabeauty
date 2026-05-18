import Impostazioni from '../../models/Impostazioni';
import { createAuditLog } from '../logging/audit';

export class SettingsController {
  async get() {
    return Impostazioni.getImpostazioni();
  }

  async update(data: Record<string, unknown>, userId: string) {
    const before = await Impostazioni.getImpostazioni();
    let settings = await Impostazioni.findOne();
    if (!settings) {
      settings = await Impostazioni.create({ nomeAzienda: 'Beauty Salon', ...data });
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    await createAuditLog({ userId, action: 'settings.update', target: 'settings', targetId: settings._id.toString(), before: before as any, after: data as any });
    return settings;
  }
}

export const settingsController = new SettingsController();
