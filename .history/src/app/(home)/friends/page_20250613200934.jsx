"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendList from './FriendList';
import SuggestedList from './SuggestedList';
import BlockedList from './BlockedList';

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Bạn bè</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="friends">Bạn bè</TabsTrigger>
            <TabsTrigger value="suggested">Gợi ý</TabsTrigger>
            <TabsTrigger value="blocked">Đã chặn</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="friends">
              <FriendList />
            </TabsContent>
            
            <TabsContent value="suggested">
              <SuggestedList />
            </TabsContent>
            
            <TabsContent value="blocked">
              <BlockedList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}