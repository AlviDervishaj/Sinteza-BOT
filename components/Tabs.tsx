import { FC } from "react";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./Radix/Tabs";

type Props = {
  devices: string[];
};

export const Tabs: FC<Props> = ({ devices }) => {
  if (devices.length === 0) {
    return (
      <TabsRoot value="">
        <TabsList label="Devices">
          <TabsTrigger value="">No devices found</TabsTrigger>
        </TabsList>
        <TabsContent value="">
          <div className="p-4 text-center">No devices found</div>
        </TabsContent>
      </TabsRoot>
    );
  }
  return (
    <TabsRoot value={devices[0]}>
      <TabsList label="Usernames">
        {devices.map((device, index) => (
          <TabsTrigger value={device} key={`${device} ${index}`}>
            {device}
          </TabsTrigger>
        ))}
      </TabsList>
      {devices.map((device, index) => (
        <TabsContent value={device} key={`${device} ${index}`}>
          <p>{device}</p>
        </TabsContent>
      ))}
    </TabsRoot>
  );
};
