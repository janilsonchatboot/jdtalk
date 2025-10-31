import { 
  User, InsertUser, 
  Customer, InsertCustomer, 
  Conversation, InsertConversation, ConversationWithCustomer,
  Message, InsertMessage,
  Ticket, InsertTicket, TicketWithDetails,
  Order, InsertOrder,
  Pipeline, InsertPipeline,
  PipelineStage, InsertPipelineStage,
  Lead, InsertLead, LeadWithDetails,
  LeadActivity, InsertLeadActivity,
  WhatsAppConfig, InsertWhatsAppConfig,
  Plugin, InsertPlugin, PluginManifest,
  PluginDependency, InsertPluginDependency,
  PluginSetting, InsertPluginSetting,
  PluginRegistry, InsertPluginRegistry,
  users, customers, conversations, messages, tickets, orders,
  pipelines, pipelineStages, leads, leadActivities, whatsappConfig,
  plugins, pluginDependencies, pluginSettings, pluginRegistry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  
  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByCustomerId(customerId: number): Promise<Conversation | undefined>;
  getConversationsWithCustomers(): Promise<ConversationWithCustomer[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // Tickets
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByConversationId(conversationId: number): Promise<Ticket | undefined>;
  getTicketsWithDetails(): Promise<TicketWithDetails[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined>;
  
  // Orders
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Pipelines (Kanban)
  getPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: number, pipeline: Partial<Pipeline>): Promise<Pipeline | undefined>;
  
  // Pipeline Stages (Kanban Columns)
  getPipelineStages(pipelineId: number): Promise<PipelineStage[]>;
  getPipelineStage(id: number): Promise<PipelineStage | undefined>;
  createPipelineStage(stage: InsertPipelineStage): Promise<PipelineStage>;
  updatePipelineStage(id: number, stage: Partial<PipelineStage>): Promise<PipelineStage | undefined>;
  
  // Leads (Kanban Cards)
  getLead(id: number): Promise<Lead | undefined>;
  getLeadsByPipeline(pipelineId: number): Promise<LeadWithDetails[]>;
  getLeadsByStage(stageId: number): Promise<LeadWithDetails[]>;
  getLeadsByCustomer(customerId: number): Promise<LeadWithDetails[]>;
  getLeadByConversation(conversationId: number): Promise<LeadWithDetails | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  
  // Lead Activities (Notas e atividades no lead)
  getLeadActivities(leadId: number): Promise<LeadActivity[]>;
  createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;
  
  // WhatsApp Config
  getWhatsAppConfig(): Promise<WhatsAppConfig | undefined>;
  updateWhatsAppConfig(config: Partial<WhatsAppConfig>): Promise<WhatsAppConfig | undefined>;
  createWhatsAppConfig(config: InsertWhatsAppConfig): Promise<WhatsAppConfig>;
  
  // Plugin System
  getPlugin(id: number): Promise<Plugin | undefined>;
  getPluginBySlug(slug: string): Promise<Plugin | undefined>;
  getAllPlugins(): Promise<Plugin[]>;
  getActivePlugins(): Promise<Plugin[]>;
  createPlugin(plugin: InsertPlugin): Promise<Plugin>;
  updatePlugin(id: number, plugin: Partial<Plugin>): Promise<Plugin | undefined>;
  activatePlugin(id: number): Promise<Plugin | undefined>;
  deactivatePlugin(id: number): Promise<Plugin | undefined>;
  deletePlugin(id: number): Promise<boolean>;
  
  // Plugin Dependencies
  getPluginDependencies(pluginId: number): Promise<PluginDependency[]>;
  createPluginDependency(dependency: InsertPluginDependency): Promise<PluginDependency>;
  deletePluginDependency(id: number): Promise<boolean>;
  
  // Plugin Settings
  getPluginSetting(pluginId: number, key: string): Promise<PluginSetting | undefined>;
  getPluginSettings(pluginId: number): Promise<PluginSetting[]>;
  createPluginSetting(setting: InsertPluginSetting): Promise<PluginSetting>;
  updatePluginSetting(id: number, value: any): Promise<PluginSetting | undefined>;
  deletePluginSetting(id: number): Promise<boolean>;
  
  // Plugin Registry
  getPluginRegistryItems(): Promise<PluginRegistry[]>;
  getPluginRegistryItemBySlug(slug: string): Promise<PluginRegistry | undefined>;
  createPluginRegistryItem(item: InsertPluginRegistry): Promise<PluginRegistry>;
  updatePluginRegistryItem(id: number, item: Partial<PluginRegistry>): Promise<PluginRegistry | undefined>;
  deletePluginRegistryItem(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Customers
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phoneNumber, phoneNumber));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<Customer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customerUpdate)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  // Conversations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationByCustomerId(customerId: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.customerId, customerId));
    return conversation;
  }

  async getConversationsWithCustomers(): Promise<ConversationWithCustomer[]> {
    // First get all conversations
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.lastMessageAt));
    
    // Create an array to hold our results
    const result: ConversationWithCustomer[] = [];
    
    // For each conversation, get the customer and the last message
    for (const conversation of allConversations) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, conversation.customerId));
      
      // Get the last message for this conversation
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(desc(messages.timestamp))
        .limit(1);
      
      if (customer) {
        result.push({
          ...conversation,
          customer,
          lastMessage
        });
      }
    }
    
    return result;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, conversationUpdate: Partial<Conversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set(conversationUpdate)
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Tickets
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketByConversationId(conversationId: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.conversationId, conversationId));
    return ticket;
  }

  async getTicketsWithDetails(): Promise<TicketWithDetails[]> {
    // Get all tickets
    const allTickets = await db.select().from(tickets);
    
    // Create an array to hold our results
    const result: TicketWithDetails[] = [];
    
    // For each ticket, get the related conversation, customer, and assigned user
    for (const ticket of allTickets) {
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, ticket.conversationId));
      
      if (conversation) {
        const [customer] = await db
          .select()
          .from(customers)
          .where(eq(customers.id, conversation.customerId));
        
        let assignedTo: User | undefined;
        if (ticket.assignedToId !== null) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, ticket.assignedToId));
          assignedTo = user;
        }
        
        const customerOrders = await db
          .select()
          .from(orders)
          .where(eq(orders.customerId, conversation.customerId));
        
        if (customer) {
          result.push({
            ...ticket,
            conversation,
            customer,
            assignedTo,
            orders: customerOrders
          });
        }
      }
    }
    
    return result;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateTicket(id: number, ticketUpdate: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set(ticketUpdate)
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Orders
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  // Pipelines (Kanban)
  async getPipelines(): Promise<Pipeline[]> {
    return db.select().from(pipelines).where(eq(pipelines.isActive, true));
  }

  async getPipeline(id: number): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, id));
    return pipeline;
  }

  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const [pipeline] = await db
      .insert(pipelines)
      .values(insertPipeline)
      .returning();
    return pipeline;
  }

  async updatePipeline(id: number, pipelineUpdate: Partial<Pipeline>): Promise<Pipeline | undefined> {
    const [updatedPipeline] = await db
      .update(pipelines)
      .set(pipelineUpdate)
      .where(eq(pipelines.id, id))
      .returning();
    return updatedPipeline;
  }

  // Pipeline Stages (Kanban Columns)
  async getPipelineStages(pipelineId: number): Promise<PipelineStage[]> {
    return db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, pipelineId))
      .orderBy(pipelineStages.order);
  }

  async getPipelineStage(id: number): Promise<PipelineStage | undefined> {
    const [stage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, id));
    return stage;
  }

  async createPipelineStage(insertStage: InsertPipelineStage): Promise<PipelineStage> {
    const [stage] = await db
      .insert(pipelineStages)
      .values(insertStage)
      .returning();
    return stage;
  }

  async updatePipelineStage(id: number, stageUpdate: Partial<PipelineStage>): Promise<PipelineStage | undefined> {
    const [updatedStage] = await db
      .update(pipelineStages)
      .set(stageUpdate)
      .where(eq(pipelineStages.id, id))
      .returning();
    return updatedStage;
  }

  // Leads (Kanban Cards)
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadsByPipeline(pipelineId: number): Promise<LeadWithDetails[]> {
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.pipelineId, pipelineId));
    
    return this.hydrateLeadsWithDetails(allLeads);
  }

  async getLeadsByStage(stageId: number): Promise<LeadWithDetails[]> {
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.stageId, stageId));
    
    return this.hydrateLeadsWithDetails(allLeads);
  }

  async getLeadsByCustomer(customerId: number): Promise<LeadWithDetails[]> {
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.customerId, customerId));
    
    return this.hydrateLeadsWithDetails(allLeads);
  }

  async getLeadByConversation(conversationId: number): Promise<LeadWithDetails | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.conversationId, conversationId));
    
    if (!lead) return undefined;
    
    const hydratedLeads = await this.hydrateLeadsWithDetails([lead]);
    return hydratedLeads[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async updateLead(id: number, leadUpdate: Partial<Lead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set(leadUpdate)
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  // Lead Activities
  async getLeadActivities(leadId: number): Promise<LeadActivity[]> {
    return db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  async createLeadActivity(insertActivity: InsertLeadActivity): Promise<LeadActivity> {
    const [activity] = await db
      .insert(leadActivities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  // WhatsApp Config
  async getWhatsAppConfig(): Promise<WhatsAppConfig | undefined> {
    const [config] = await db.select().from(whatsappConfig).limit(1);
    return config;
  }
  
  async createWhatsAppConfig(insertConfig: InsertWhatsAppConfig): Promise<WhatsAppConfig> {
    const [config] = await db
      .insert(whatsappConfig)
      .values(insertConfig)
      .returning();
    return config;
  }
  
  async updateWhatsAppConfig(configUpdate: Partial<WhatsAppConfig>): Promise<WhatsAppConfig | undefined> {
    // Obtém o primeiro registro de configuração
    const [currentConfig] = await db.select().from(whatsappConfig).limit(1);
    
    if (!currentConfig) {
      return undefined;
    }
    
    const [updatedConfig] = await db
      .update(whatsappConfig)
      .set(configUpdate)
      .where(eq(whatsappConfig.id, currentConfig.id))
      .returning();
    
    return updatedConfig;
  }

  // Plugin System
  async getPlugin(id: number): Promise<Plugin | undefined> {
    const [plugin] = await db.select().from(plugins).where(eq(plugins.id, id));
    return plugin;
  }

  async getPluginBySlug(slug: string): Promise<Plugin | undefined> {
    const [plugin] = await db.select().from(plugins).where(eq(plugins.slug, slug));
    return plugin;
  }

  async getAllPlugins(): Promise<Plugin[]> {
    return db.select().from(plugins);
  }

  async getActivePlugins(): Promise<Plugin[]> {
    return db.select().from(plugins).where(eq(plugins.isActive, true));
  }

  async createPlugin(insertPlugin: InsertPlugin): Promise<Plugin> {
    const [plugin] = await db
      .insert(plugins)
      .values(insertPlugin)
      .returning();
    return plugin;
  }

  async updatePlugin(id: number, pluginUpdate: Partial<Plugin>): Promise<Plugin | undefined> {
    const [updatedPlugin] = await db
      .update(plugins)
      .set({ ...pluginUpdate, updatedAt: new Date() })
      .where(eq(plugins.id, id))
      .returning();
    return updatedPlugin;
  }

  async activatePlugin(id: number): Promise<Plugin | undefined> {
    return this.updatePlugin(id, { isActive: true });
  }

  async deactivatePlugin(id: number): Promise<Plugin | undefined> {
    return this.updatePlugin(id, { isActive: false });
  }

  async deletePlugin(id: number): Promise<boolean> {
    try {
      // Primeiro, removemos as dependências e configurações
      await db.delete(pluginDependencies).where(eq(pluginDependencies.pluginId, id));
      await db.delete(pluginSettings).where(eq(pluginSettings.pluginId, id));
      
      // Por fim, removemos o plugin
      await db.delete(plugins).where(eq(plugins.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao excluir plugin:", error);
      return false;
    }
  }

  // Plugin Dependencies
  async getPluginDependencies(pluginId: number): Promise<PluginDependency[]> {
    return db
      .select()
      .from(pluginDependencies)
      .where(eq(pluginDependencies.pluginId, pluginId));
  }

  async createPluginDependency(insertDependency: InsertPluginDependency): Promise<PluginDependency> {
    const [dependency] = await db
      .insert(pluginDependencies)
      .values(insertDependency)
      .returning();
    return dependency;
  }

  async deletePluginDependency(id: number): Promise<boolean> {
    try {
      await db.delete(pluginDependencies).where(eq(pluginDependencies.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao excluir dependência do plugin:", error);
      return false;
    }
  }

  // Plugin Settings
  async getPluginSetting(pluginId: number, key: string): Promise<PluginSetting | undefined> {
    const [setting] = await db
      .select()
      .from(pluginSettings)
      .where(and(
        eq(pluginSettings.pluginId, pluginId),
        eq(pluginSettings.key, key)
      ));
    return setting;
  }

  async getPluginSettings(pluginId: number): Promise<PluginSetting[]> {
    return db
      .select()
      .from(pluginSettings)
      .where(eq(pluginSettings.pluginId, pluginId));
  }

  async createPluginSetting(insertSetting: InsertPluginSetting): Promise<PluginSetting> {
    const [setting] = await db
      .insert(pluginSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  async updatePluginSetting(id: number, value: any): Promise<PluginSetting | undefined> {
    const [updatedSetting] = await db
      .update(pluginSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(pluginSettings.id, id))
      .returning();
    return updatedSetting;
  }

  async deletePluginSetting(id: number): Promise<boolean> {
    try {
      await db.delete(pluginSettings).where(eq(pluginSettings.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao excluir configuração do plugin:", error);
      return false;
    }
  }

  // Plugin Registry
  async getPluginRegistryItems(): Promise<PluginRegistry[]> {
    return db.select().from(pluginRegistry);
  }

  async getPluginRegistryItemBySlug(slug: string): Promise<PluginRegistry | undefined> {
    const [item] = await db
      .select()
      .from(pluginRegistry)
      .where(eq(pluginRegistry.slug, slug));
    return item;
  }

  async createPluginRegistryItem(insertItem: InsertPluginRegistry): Promise<PluginRegistry> {
    const [item] = await db
      .insert(pluginRegistry)
      .values(insertItem)
      .returning();
    return item;
  }

  async updatePluginRegistryItem(id: number, itemUpdate: Partial<PluginRegistry>): Promise<PluginRegistry | undefined> {
    const [updatedItem] = await db
      .update(pluginRegistry)
      .set({ ...itemUpdate, updatedAt: new Date() })
      .where(eq(pluginRegistry.id, id))
      .returning();
    return updatedItem;
  }

  async deletePluginRegistryItem(id: number): Promise<boolean> {
    try {
      await db.delete(pluginRegistry).where(eq(pluginRegistry.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao excluir item do registro de plugins:", error);
      return false;
    }
  }

  // Helper methods
  private async hydrateLeadsWithDetails(leadsList: Lead[]): Promise<LeadWithDetails[]> {
    const result: LeadWithDetails[] = [];
    
    for (const lead of leadsList) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, lead.customerId));

      const [stage] = await db
        .select()
        .from(pipelineStages)
        .where(eq(pipelineStages.id, lead.stageId));
        
      const [pipeline] = await db
        .select()
        .from(pipelines)
        .where(eq(pipelines.id, lead.pipelineId));
      
      let conversation: Conversation | undefined;
      if (lead.conversationId) {
        const [conv] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, lead.conversationId));
        conversation = conv;
      }
      
      let assignedUser: User | undefined;
      if (lead.assignedTo) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, lead.assignedTo));
        assignedUser = user;
      }
      
      // Obter atividades do lead
      const activities = await db
        .select()
        .from(leadActivities)
        .where(eq(leadActivities.leadId, lead.id))
        .orderBy(desc(leadActivities.createdAt));
      
      if (customer && stage && pipeline) {
        result.push({
          ...lead,
          customer,
          conversation,
          stage,
          pipeline,
          assignedUser,
          activities
        });
      }
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();