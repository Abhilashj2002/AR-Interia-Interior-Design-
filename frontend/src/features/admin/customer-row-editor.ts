import type { User } from '../../../../types';

export type AdminCustomerRowRenderArgs = {
  customer: User;
  isEditing: boolean;
  customerLikes: number;
  customerSavedPackages: number;
  customerFeedbacks: number;
  customerBookings: number;
  customerPayments: number;
  escapeHtml: (value: string) => string;
};

export const renderAdminCustomerRow = ({
  customer,
  isEditing,
  customerLikes,
  customerSavedPackages,
  customerFeedbacks,
  customerBookings,
  customerPayments,
  escapeHtml
}: AdminCustomerRowRenderArgs): string => {
  if (!isEditing) {
    return `
      <tr class="border-b border-black/5 hover:bg-slate-50">
        <td class="py-3 px-3 font-semibold text-[color:var(--primary)]">${escapeHtml(customer.name)}</td>
        <td class="py-3 px-3 text-slate-600">${escapeHtml(customer.email)}</td>
        <td class="py-3 px-3 text-slate-600">${escapeHtml(String((customer as any).location || '-'))}</td>
        <td class="py-3 px-3 text-slate-600">${escapeHtml(String((customer as any).pincode || '-'))}</td>
        <td class="py-3 px-3"><span class="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">${customerLikes}</span></td>
        <td class="py-3 px-3"><span class="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold">${customerSavedPackages}</span></td>
        <td class="py-3 px-3"><span class="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">${customerFeedbacks}</span></td>
        <td class="py-3 px-3"><span class="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">${customerBookings}</span></td>
        <td class="py-3 px-3"><span class="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">${customerPayments}</span></td>
        <td class="py-3 px-3">
          <div class="flex flex-wrap gap-2">
            <button type="button" data-action="admin-edit-customer-inline" data-customer-id="${escapeHtml(customer.id)}" class="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">Edit</button>
            <button type="button" data-action="view-customer" data-customer-id="${escapeHtml(customer.id)}" class="px-3 py-1 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold hover:opacity-80 transition-opacity">View</button>
          </div>
        </td>
      </tr>
    `;
  }

  return `
    <tr class="border-b border-black/5 bg-slate-50/80">
      <td colspan="10" class="py-3 px-3">
        <form data-form="admin-inline-customer-form" data-customer-id="${escapeHtml(customer.id)}" class="rounded-2xl border border-black/10 bg-white p-4 space-y-4 shadow-sm">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div class="text-sm font-semibold text-[color:var(--primary)]">Editing ${escapeHtml(customer.name)}</div>
              <div class="text-xs text-slate-400">Changes are saved locally in the frontend state.</div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-action="admin-cancel-customer-inline-edit" class="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" class="px-3 py-1.5 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold">Save</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input name="name" value="${escapeHtml(customer.name)}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Customer Name" />
            <input name="email" type="email" value="${escapeHtml(customer.email)}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Email" />
            <input name="dob" type="date" value="${escapeHtml(String((customer as any).dob || ''))}" class="px-3 py-2 rounded-xl border border-black/10" />
            <select name="gender" class="px-3 py-2 rounded-xl border border-black/10">
              <option value="" ${!(customer as any).gender ? 'selected' : ''}>Select Gender</option>
              <option value="male" ${String((customer as any).gender || '').toLowerCase() === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${String((customer as any).gender || '').toLowerCase() === 'female' ? 'selected' : ''}>Female</option>
              <option value="other" ${String((customer as any).gender || '').toLowerCase() === 'other' ? 'selected' : ''}>Other</option>
              <option value="prefer-not-to-say" ${String((customer as any).gender || '').toLowerCase() === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
            </select>
            <input name="location" value="${escapeHtml(String((customer as any).location || ''))}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Location" />
            <input name="pincode" value="${escapeHtml(String((customer as any).pincode || ''))}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Pincode" />
            <input name="phone" value="${escapeHtml(String((customer as any).phone || ''))}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Phone" />
            <input name="profilePhoto" value="${escapeHtml(String((customer as any).profilePhoto || ''))}" class="px-3 py-2 rounded-xl border border-black/10 md:col-span-2" placeholder="Profile Photo URL / local data URL" />
            <div class="md:col-span-1">
              <input
                type="file"
                data-action="upload-admin-customer-photo"
                data-customer-id="${escapeHtml(customer.id)}"
                accept="image/*"
                class="w-full text-xs px-3 py-2 rounded-xl border border-black/10 bg-white cursor-pointer file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-[color:var(--primary)] file:text-white file:font-semibold file:cursor-pointer"
              />
              <div class="text-[10px] text-slate-400 mt-1">Upload local photo</div>
            </div>
            ${String((customer as any).profilePhoto || '').trim()
      ? `<div class="md:col-span-3 flex items-center gap-3"><img src="${escapeHtml(String((customer as any).profilePhoto))}" alt="Profile" class="w-12 h-12 rounded-lg object-cover border border-black/10" /><span class="text-xs text-slate-500">Current profile photo preview</span></div>`
      : ''}
            <textarea name="address" rows="2" class="px-3 py-2 rounded-xl border border-black/10 md:col-span-3" placeholder="Address">${escapeHtml(String((customer as any).address || ''))}</textarea>
            <textarea name="bio" rows="2" class="px-3 py-2 rounded-xl border border-black/10 md:col-span-3" placeholder="Bio">${escapeHtml(String((customer as any).bio || ''))}</textarea>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Likes</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">${customerLikes}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Saved Packages</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">${customerSavedPackages}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Feedback</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">${customerFeedbacks}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Bookings</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">${customerBookings}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Payments</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">${customerPayments}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-black/5 p-3">
              <div class="text-slate-400 uppercase tracking-wide">Record</div>
              <div class="mt-1 font-semibold text-[color:var(--primary)]">Inline</div>
            </div>
          </div>
        </form>
      </td>
    </tr>
  `;
};
