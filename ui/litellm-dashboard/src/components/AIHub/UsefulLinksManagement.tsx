import TableIconActionButton from "@/components/common_components/IconActionButton/TableIconActionButtons/TableIconActionButton";
import NotificationsManager from "@/components/molecules/notifications_manager";
import { isAdminRole } from "@/utils/roles";
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, PlusCircleIcon } from "@heroicons/react/outline";
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProxyBaseUrl, getPublicModelHubInfo, updateUsefulLinksCall } from "../networking";

interface UsefulLinksManagementProps {
  accessToken: string | null;
  userRole: string | null;
}

interface Link {
  id: string;
  displayName: string;
  url: string;
  index?: number;
}

const UsefulLinksManagement: React.FC<UsefulLinksManagementProps> = ({ accessToken, userRole }) => {
  const { t } = useTranslation("common");
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ url: "", displayName: "" });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRearranging, setIsRearranging] = useState(false);
  const [originalLinksOrder, setOriginalLinksOrder] = useState<Link[]>([]);

  const fetchUsefulLinks = async () => {
    if (!accessToken) return;

    try {
      const response = await getPublicModelHubInfo();

      if (response && response.useful_links) {
        const usefulLinks = response.useful_links || {};

        // Convert object to array of links with ids
        // Handle both old format (Dict[str, str]) and new format (Dict[str, {url, index}])
        const linksArray = Object.entries(usefulLinks)
          .map(([displayName, value]) => {
            // Check if it's the new format with {url, index}
            if (typeof value === "object" && value !== null && "url" in value) {
              return {
                id: `${(value as any).index ?? 0}-${displayName}`,
                displayName,
                url: (value as any).url as string,
                index: (value as any).index ?? 0,
              };
            } else {
              // Old format: just a string URL
              return {
                id: `0-${displayName}`,
                displayName,
                url: value as string,
                index: 0,
              };
            }
          })
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
          .map((link, index) => ({
            ...link,
            id: `${index}-${link.displayName}`,
          }));

        setLinks(linksArray);
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error("Error fetching useful links:", error);
      setLinks([]);
    }
  };

  useEffect(() => {
    fetchUsefulLinks();
  }, [accessToken]);

  // Check if user is admin
  if (!isAdminRole(userRole || "")) {
    return null;
  }

  const saveLinksToBackend = async (updatedLinks: Link[]) => {
    if (!accessToken) return false;

    try {
      // Convert array back to object format with index for ordering
      // New format: { "displayName": { "url": "...", "index": 0 } }
      const linksObject: Record<string, { url: string; index: number }> = {};
      updatedLinks.forEach((link, index) => {
        linksObject[link.displayName] = {
          url: link.url,
          index: index,
        };
      });

      await updateUsefulLinksCall(accessToken, linksObject);

      return true;
    } catch (error) {
      console.error("Error saving links:", error);
      NotificationsManager.fromBackend(t("publicHub.links.saveFailed", { error: String(error) }));
      return false;
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url || !newLink.displayName) return;

    // Validate URL
    try {
      new URL(newLink.url);
    } catch {
      NotificationsManager.fromBackend(t("publicHub.links.invalidUrl"));
      return;
    }

    // Check for duplicate display names
    if (links.some((link) => link.displayName === newLink.displayName)) {
      NotificationsManager.fromBackend(t("publicHub.links.duplicateName"));
      return;
    }

    const newLinkObj: Link = {
      id: `${Date.now()}-${newLink.displayName}`,
      displayName: newLink.displayName,
      url: newLink.url,
    };

    const updatedLinks = [...links, newLinkObj];

    if (await saveLinksToBackend(updatedLinks)) {
      setLinks(updatedLinks);
      setNewLink({ url: "", displayName: "" });
      NotificationsManager.success(t("publicHub.links.added"));
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink({ ...link });
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    // Validate URL
    try {
      new URL(editingLink.url);
    } catch {
      NotificationsManager.fromBackend(t("publicHub.links.invalidUrl"));
      return;
    }

    // Check for duplicate display names (excluding current link)
    if (links.some((link) => link.id !== editingLink.id && link.displayName === editingLink.displayName)) {
      NotificationsManager.fromBackend(t("publicHub.links.duplicateName"));
      return;
    }

    const updatedLinks = links.map((link) => (link.id === editingLink.id ? editingLink : link));

    if (await saveLinksToBackend(updatedLinks)) {
      setLinks(updatedLinks);
      setEditingLink(null);
      NotificationsManager.success(t("publicHub.links.updated"));
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
  };

  const deleteLink = async (linkId: string) => {
    const updatedLinks = links.filter((link) => link.id !== linkId);

    if (await saveLinksToBackend(updatedLinks)) {
      setLinks(updatedLinks);
      NotificationsManager.success(t("publicHub.links.deleted"));
    }
  };

  const setCurrentLink = (url: string) => {
    window.open(url, "_blank");
  };

  const handleStartRearranging = () => {
    if (editingLink) {
      setEditingLink(null);
    }
    setOriginalLinksOrder([...links]);
    setIsRearranging(true);
  };

  const handleCancelRearranging = () => {
    setLinks([...originalLinksOrder]);
    setIsRearranging(false);
    setOriginalLinksOrder([]);
  };

  const handleSaveRearranging = async () => {
    if (await saveLinksToBackend(links)) {
      setIsRearranging(false);
      setOriginalLinksOrder([]);
      NotificationsManager.success(t("publicHub.links.orderSaved"));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    setLinks(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    setLinks(newLinks);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col">
          <Title className="mb-0">{t("publicHub.links.title")}</Title>
          <p className="text-sm text-gray-500">{t("publicHub.links.description")}</p>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <div className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">{t("publicHub.links.addNew")}</Text>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t("publicHub.links.displayName")}</label>
                <input
                  type="text"
                  value={newLink.displayName}
                  onChange={(e) =>
                    setNewLink({
                      ...newLink,
                      displayName: e.target.value,
                    })
                  }
                  placeholder={t("publicHub.links.friendlyName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL</label>
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({
                      ...newLink,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddLink}
                  disabled={!newLink.url || !newLink.displayName}
                  className={`flex items-center px-4 py-2 rounded-md text-sm ${!newLink.url || !newLink.displayName ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  <PlusCircleIcon className="w-4 h-4 mr-1" />
                  {t("publicHub.links.add")}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">{t("publicHub.links.manageExisting")}</Text>
            <div className="flex items-center space-x-2">
              <Link
                href={`${getProxyBaseUrl()}/ui/model_hub_table`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-sm hover:bg-blue-100 flex items-center"
                title={t("publicHub.links.openHub")}
              >
                {t("publicHub.links.publicHub")}
                <ExternalLinkIcon className="w-4 h-4 ml-1" />
              </Link>
              {!isRearranging ? (
                <button
                  onClick={handleStartRearranging}
                  className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-sm hover:bg-purple-100 flex items-center"
                >
                  {t("publicHub.links.rearrange")}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveRearranging}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-sm hover:bg-green-700"
                  >
                    {t("publicHub.links.saveOrder")}
                  </button>
                  <button
                    onClick={handleCancelRearranging}
                    className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-sm hover:bg-gray-100"
                  >
                    {t("publicHub.links.cancel")}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg custom-border relative">
            <div className="overflow-x-auto">
              <Table className="[&_td]:py-0.5 [&_th]:py-1">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="py-1 h-8">{t("publicHub.links.displayName")}</TableHeaderCell>
                    <TableHeaderCell className="py-1 h-8">URL</TableHeaderCell>
                    <TableHeaderCell className="py-1 h-8">{t("publicHub.links.actions")}</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {links.map((link, index) => (
                    <TableRow key={link.id} className="h-8">
                      {editingLink && editingLink.id === link.id ? (
                        <>
                          <TableCell className="py-0.5">
                            <input
                              type="text"
                              value={editingLink.displayName}
                              onChange={(e) =>
                                setEditingLink({
                                  ...editingLink,
                                  displayName: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </TableCell>
                          <TableCell className="py-0.5">
                            <input
                              type="text"
                              value={editingLink.url}
                              onChange={(e) =>
                                setEditingLink({
                                  ...editingLink,
                                  url: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </TableCell>
                          <TableCell className="py-0.5 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateLink}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-sm hover:bg-blue-100"
                              >
                                {t("publicHub.links.save")}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-sm hover:bg-gray-100"
                              >
                                {t("publicHub.links.cancel")}
                              </button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="py-0.5 text-sm text-gray-900">{link.displayName}</TableCell>
                          <TableCell className="py-0.5 text-sm text-gray-500">{link.url}</TableCell>
                          <TableCell className="py-0.5 whitespace-nowrap">
                            {isRearranging ? (
                              <div className="flex space-x-2">
                                <TableIconActionButton
                                  variant="Up"
                                  onClick={() => handleMoveUp(index)}
                                  tooltipText={t("publicHub.links.moveUp")}
                                  disabled={index === 0}
                                  disabledTooltipText={t("publicHub.links.alreadyTop")}
                                  dataTestId={`move-up-${link.id}`}
                                />
                                <TableIconActionButton
                                  variant="Down"
                                  onClick={() => handleMoveDown(index)}
                                  tooltipText={t("publicHub.links.moveDown")}
                                  disabled={index === links.length - 1}
                                  disabledTooltipText={t("publicHub.links.alreadyBottom")}
                                  dataTestId={`move-down-${link.id}`}
                                />
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <TableIconActionButton
                                  variant="Open"
                                  onClick={() => setCurrentLink(link.url)}
                                  tooltipText={t("publicHub.links.open")}
                                  dataTestId={`open-link-${link.id}`}
                                />
                                <TableIconActionButton
                                  variant="Edit"
                                  onClick={() => handleEditLink(link)}
                                  tooltipText={t("publicHub.links.edit")}
                                  dataTestId={`edit-link-${link.id}`}
                                />
                                <TableIconActionButton
                                  variant="Delete"
                                  onClick={() => deleteLink(link.id)}
                                  tooltipText={t("publicHub.links.delete")}
                                  dataTestId={`delete-link-${link.id}`}
                                />
                              </div>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  {links.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-0.5 text-sm text-gray-500 text-center">
                        {t("publicHub.links.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UsefulLinksManagement;
