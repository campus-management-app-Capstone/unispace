import React from 'react';
import Link from 'next/link';
import {
  FileText,
  LifeBuoy,
  MapPinned,
  Megaphone,
  ParkingCircle,
  User2,
  Wallet,
} from 'lucide-react';

/**
 * Student "More" page displaying quick access cards for secondary features.
 */
const StudentMorePage = () => {
  /**
   * Card configuration for each secondary feature on the student "More" page, including icon.
   */
  const moreItems: {
    key: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'map', label: 'Map', href: '/map', Icon: MapPinned },
    { key: 'form', label: 'Form', href: '/evaluation', Icon: FileText },
    { key: 'helpdesk', label: 'Helpdesk', href: '/help', Icon: LifeBuoy },
    { key: 'announcement', label: 'Announcement', href: '/announcement', Icon: Megaphone },
    { key: 'wallet', label: 'Wallet', href: '/wallet', Icon: Wallet },
    { key: 'parking', label: 'Parking', href: '/parking', Icon: ParkingCircle },
    { key: 'profile', label: 'Profile', href: '/home', Icon: User2 },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-sm text-gray-600">
          Access additional tools and services available to you.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {moreItems.map(({ key, label, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 px-3 py-3 transition-colors hover:border-gray-300 hover:bg-gray-50 md:px-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentMorePage;
